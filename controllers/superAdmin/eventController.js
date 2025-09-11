import { Sequelize, remoteSequelize } from "../../models/index.js";
import db from "../../models/index.js";
import { Op, where } from "sequelize";
import handleSequelizeError from "../../utils/handelSequelizeError.js";
// Import remote User model factory
import UserModelFactory from "../../models/remote/user.js";
import OccasionModelFactory from "../../models/remote/occasion.js";

// Initialize remote User model with remoteSequelize
const RemoteUser = UserModelFactory(remoteSequelize, Sequelize.DataTypes);
const RemoteOccasion = OccasionModelFactory(
  remoteSequelize,
  Sequelize.DataTypes
);

export const getAllEvents = async (req, res) => {
  try {
    if (!db.Event) {
      throw new Error("Event model is not initialized");
    }

    const events = await db.Event.findAll();
    if (!events || events.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No events found", data: [] });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Events retrieved successfully",
        data: events,
      });
  } catch (error) {
    console.log(error);

    // Handle Sequelize errors
    const handled = handleSequelizeError(error, res);
    if (handled) return handled;

    // Handle generic Node.js / unexpected errors
    return res.status(500).json({
      message: "Unexpected server error",
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : error.message,
    });
  }
};
export const EventFiltration = async (req, res) => {
  try {
    const { q, occasion } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 1️⃣ Build Event Search Conditions
    const eventConditions = {};
    if (q && q.trim() !== "") {
      eventConditions[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { slug: { [Op.like]: `%${q}%` } },
        { venue_name: { [Op.like]: `%${q}%` } },
        { venue_address: { [Op.like]: `%${q}%` } },
        Sequelize.where(
          Sequelize.fn(
            "JSON_SEARCH",
            Sequelize.col("occasion_data"),
            "one",
            `%${q}%`
          ),
          { [Op.not]: null }
        ),
      ];
    }

    // 2️⃣ Occasion filter (using actual occasions table in DB-A)
    if (occasion) {
      const foundOccasion = await RemoteOccasion.findOne({
        where: { name: { [Op.like]: `%${occasion}%` } },
        attributes: ["id"],
      });

      if (foundOccasion) {
        eventConditions.occasion_id = foundOccasion.id;
      } else {
        return res.status(404).json({
          success: false,
          message: `No occasion found with name: ${occasion}`,
        });
      }
    }

    // 3️⃣ Fetch Events (DB-B)
    const events = await db.Event.findAll({
      where: eventConditions,
      attributes: [
        "id",
        "user_id",
        "occasion_id",
        "title",
        "slug",
        "event_datetime",
        "venue_name",
        "venue_address",
        "occasion_data",
      ],
      order: [["created_at", "desc"]],
      limit,
      offset,
    });

    // Collect User IDs
    const userIds = events.map((e) => e.user_id);

    // 4️⃣ Search Users (DB-A) if q provided
    let matchingUserIds = [];
    if (q && q.trim() !== "") {
      const users = await RemoteUser.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { email: { [Op.like]: `%${q}%` } },
            { mobile: { [Op.like]: `%${q}%` } },
          ],
        },
        attributes: ["id"],
      });
      matchingUserIds = users.map((u) => u.id);
    }

    // 5️⃣ Merge results
    let filteredEvents = [...events];
    if (matchingUserIds.length > 0) {
      const userEvents = await db.Event.findAll({
        where: { user_id: { [Op.in]: matchingUserIds } },
        attributes: [
          "id",
          "user_id",
          "occasion_id",
          "title",
          "slug",
          "event_datetime",
          "venue_name",
          "venue_address",
          "occasion_data",
        ],
      });
      filteredEvents = [...filteredEvents, ...userEvents];
    }

    // Deduplicate
    filteredEvents = filteredEvents.filter(
      (event, index, self) =>
        index === self.findIndex((e) => e.id === event.id)
    );

    if (!filteredEvents.length) {
      return res.status(404).json({
        success: false,
        message: "No events found matching your query",
      });
    }

    // 6️⃣ Fetch user + occasion details
    const finalUsers = await RemoteUser.findAll({
      where: { id: { [Op.in]: filteredEvents.map((e) => e.user_id) } },
      attributes: ["id", "name", "mobile"],
    });

    const finalOccasions = await RemoteOccasion.findAll({
      where: { id: { [Op.in]: filteredEvents.map((e) => e.occasion_id) } },
      attributes: ["id", "name"],
    });

    const userMap = finalUsers.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});

    const occasionMap = finalOccasions.reduce((acc, occ) => {
      acc[occ.id] = occ;
      return acc;
    }, {});

    // 7️⃣ Final Response
    const response = filteredEvents.map((event) => {
      const user = userMap[event.user_id] || {};
      const occ = occasionMap[event.occasion_id] || {};
      return {
        event_id: event.id,
        user_name: user.name || null,
        user_mobile: user.mobile || null,
        occasion_name: occ.name || null,
        title: event.title,
        slug: event.slug,
        event_datetime: event.event_datetime,
        venue_name: event.venue_name,
        venue_address: event.venue_address,
        occasion_data: event.occasion_data,
      };
    });

    res.json({
      success: true,
      count: response.length,
      page,
      limit,
      data: response,
    });
  } catch (error) {
    console.error("Error searching events:", error);
    return res.status(500).json({
      success: false,
      message: "Unexpected server error",
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : error.message,
    });
  }
};
