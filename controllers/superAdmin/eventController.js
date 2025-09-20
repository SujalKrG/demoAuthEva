import { Sequelize, remoteSequelize } from "../../models/index.js";
import db from "../../models/index.js";
import { Op, where } from "sequelize";
import handleSequelizeError from "../../utils/handelSequelizeError.js";
import { sanitizeName } from "../../utils/requiredMethods.js";
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
    const {
      page = 1,
      limit = 10,
      q,
      occasion,
      startDate,
      endDate,
      status,
    } = req.query;
    const offset = (page - 1) * limit;

    if (!db.Event) {
      throw new Error("Event model is not initialized");
    }

    const whereConditions = {};
    if (occasion) {
      whereConditions.occasion_id = occasion;
    }
    // 🎯 Date range filter
    if (startDate && endDate) {
      whereConditions.event_datetime = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      whereConditions.event_datetime = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      whereConditions.event_datetime = { [Op.lte]: new Date(endDate) };
    }

    // 🎯 Status filter
    if (status) {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      );

      switch (status.toLowerCase()) {
        case "today":
          whereConditions.event_datetime = {
            [Op.between]: [startOfDay, endOfDay],
          };
          break;

        case "upcoming":
          whereConditions.event_datetime = { [Op.gt]: endOfDay };
          whereConditions.deleted_at = null;
          break;

        case "completed":
          whereConditions.event_datetime = { [Op.lt]: startOfDay };
          whereConditions.deleted_at = null;
          break;

        case "deleted":
          whereConditions.deleted_at = { [Op.ne]: null };
          break;
      }
    }

    let userIds = [];

    if (q && q.trim() !== "") {
      const searchValue = `%${q}%`;

      // 🔍 Search in RemoteUser table (name & mobile)
      const matchedUsers = await RemoteUser.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: searchValue } },
            { mobile: { [Op.like]: searchValue } },
          ],
        },
        attributes: ["id"],
      });

      userIds = matchedUsers.map((u) => u.id);

      // 🔍 Search inside Events fields
      whereConditions[Op.or] = [
        { id: { [Op.like]: searchValue } },
        { user_id: { [Op.like]: searchValue } },
        { occasion_id: { [Op.like]: searchValue } },
        { title: { [Op.like]: searchValue } },
        { slug: { [Op.like]: searchValue } },
        { event_datetime: { [Op.like]: searchValue } },
        { venue_name: { [Op.like]: searchValue } },
        { venue_address: { [Op.like]: searchValue } },
        // { occasion_data: { [Op.like]: searchValue } },
        { created_at: { [Op.like]: searchValue } },
        { updated_at: { [Op.like]: searchValue } },
        { deleted_at: { [Op.like]: searchValue } },
        Sequelize.where(
          Sequelize.fn(
            "JSON_UNQUOTE",
            Sequelize.json("occasion_data.bride_name")
          ),
          { [Op.like]: searchValue }
        ),
        Sequelize.where(
          Sequelize.fn(
            "JSON_UNQUOTE",
            Sequelize.json("occasion_data.groom_name")
          ),
          { [Op.like]: searchValue }
        ),
        // 🔍 Match events by user_ids from RemoteUser search
        ...(userIds.length > 0 ? [{ user_id: { [Op.in]: userIds } }] : []),
      ];
    }
const fetchLimit = parseInt(limit)*parseInt(page)
    const { rows: events, count: total } = await db.Event.findAndCountAll({
      where: whereConditions,
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
        "created_at",
        "updated_at",
        "deleted_at",
      ],
      order: [["created_at", "desc"]],
      limit: fetchLimit,
      offset,
      paranoid: false, // ✅ include soft-deleted
    });

    if (!events || events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Events not found",
      });
    }

    // ✅ Get full user + occasion details
    const fetchedUserIds = events.map((e) => e.user_id).filter(Boolean);
    const fetchedOccasionIds = events.map((e) => e.occasion_id).filter(Boolean);

    const users = await RemoteUser.findAll({
      where: { id: { [Op.in]: fetchedUserIds } },
      attributes: ["id", "name", "mobile"],
    });

    const occasions = await RemoteOccasion.findAll({
      where: { id: { [Op.in]: fetchedOccasionIds } },
      attributes: ["id", "name"],
    });

    const userMap = users.reduce((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {});

    const occasionMap = occasions.reduce((acc, o) => {
      acc[o.id] = o;
      return acc;
    }, {});

    const result = events.map((e) => {
      let eventStatus = "upcoming";

      const eventDate = new Date(e.event_datetime);
      const today = new Date();

      // Normalize both to YYYY-MM-DD (midnight)
      const eventDay = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate()
      );
      const todayDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      if (e.deleted_at) {
        eventStatus = "deleted";
      } else if (eventDay.getTime() === todayDay.getTime()) {
        eventStatus = "today";
      } else if (eventDay.getTime() > todayDay.getTime()) {
        eventStatus = "upcoming";
      } else if (eventDay.getTime() < todayDay.getTime()) {
        eventStatus = "completed";
      }

      return {
        id: e.id,
        title: e.title,
        slug: e.slug,
        event_datetime: e.event_datetime,
        venue_name: e.venue_name,
        venue_address: e.venue_address,
        occasion_data: e.occasion_data,
        status: eventStatus, // ✅ only date matters now
        user: userMap[e.user_id] || null,
        occasion: occasionMap[e.occasion_id] || null,
        created_at: e.created_at,
        updated_at: e.updated_at,
        deleted_at: e.deleted_at,
      };
    });

    return res.status(200).json({
      success: true,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      limit: parseInt(limit),
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.log(error);

    const handled = handleSequelizeError(error, res);
    if (handled) return handled;

    return res.status(500).json({
      message: "Unexpected server error",
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : error.message,
    });
  }
};
