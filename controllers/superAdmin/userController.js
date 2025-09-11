// userController.js
import { Sequelize, remoteSequelize } from "../../models/index.js";
import db from "../../models/index.js";
import { Op, where } from "sequelize";
import handleSequelizeError from "../../utils/handelSequelizeError.js";
// Import remote User model factory
import UserModelFactory from "../../models/remote/user.js";
import { constrainedMemory } from "process";
import { assert } from "console";
import { asyncWrapProviders } from "async_hooks";
import { chownSync } from "fs";

// Initialize remote User model with remoteSequelize
const RemoteUser = UserModelFactory(remoteSequelize, Sequelize.DataTypes);

// ✅ Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await RemoteUser.findAll({
      attributes: ["id", "name", "email", "mobile", "status"], // select only required fields
      order: [["id", "DESC"]],
    });

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No users found" });
    }

    return res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error("Error fetching remote users:", error);

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

export const getUserWithEvents = async (req, res) => {
  try {
    // 1. Fetch all users from DB1
    const users = await RemoteUser.findAll({
      attributes: ["id", "name", "email", "mobile", "status"],
      order: [["id", "asc"]],
    });

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    // 2. Fetch all events from DB2
    const events = await db.Event.findAll({
      attributes: [
        "id",
        "user_id",
        "title",
        "slug",
        "event_datetime",
        "venue_name",
        "venue_address",
        "occasion_data",
      ],
    });

    // 3. Map events to corresponding users
    const response = users.map((user) => {
      const userEvents = events
        .filter((event) => event.user_id === user.id)
        .map((event) => ({
          event_id: event.id,
          title: event.title,
          slug: event.slug,
          event_datetime: event.event_datetime,
          venue_name: event.venue_name,
          venue_address: event.venue_address,
          occasion_data: event.occasion_data,
        }));

      return {
        user_id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        status: user.status,
        events: userEvents,
      };
    });

    res.json(response);
  } catch (error) {
    console.error("Error fetching users with events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const UserSearch = async (req, res) => {
 try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!q || q.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Search query 'q' is required" });
    }

    const searchQuery = q.toLowerCase();

    // 🔍 1. Search users
    const users = await RemoteUser.findAll({
      where: {
        [Op.or]: [
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("name")),
            { [Op.like]: `%${searchQuery}%` }
          ),
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("email")),
            { [Op.like]: `%${searchQuery}%` }
          ),
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("mobile")),
            { [Op.like]: `%${searchQuery}%` }
          ),
        ],
      },
      attributes: ["id", "name", "email", "mobile", "status"],
      order: [["id", "asc"]],
      limit,
      offset,
    });

    // 🔍 2. Search events
    const events = await db.Event.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { slug: { [Op.like]: `%${q}%` } },
          { venue_name: { [Op.like]: `%${q}%` } },
          { venue_address: { [Op.like]: `%${q}%` } },
          Sequelize.where(
            Sequelize.fn("JSON_SEARCH", Sequelize.col("occasion_data"), "one", `%${q}%`),
            { [Op.not]: null }
          ),
        ],
      },
      attributes: [
        "id",
        "user_id",
        "title",
        "slug",
        "event_datetime",
        "venue_name",
        "venue_address",
        "occasion_data",
      ],
      order: [["id", "asc"]],
    });

    // 🔗 3. Collect all relevant userIds
    const eventUserIds = events.map((e) => e.user_id);
    const userIds = [
      ...new Set([
        ...users.map((u) => u.id),
        ...eventUserIds,
      ]),
    ];

    if (!userIds.length) {
      return res.status(404).json({
        success: false,
        message: "No users or events found matching your query",
      });
    }

    // 🔍 4. Fetch final users
    const finalUsers = await RemoteUser.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ["id", "name", "email", "mobile", "status"],
      order: [["id", "asc"]],
    });

    // 🔗 5. Merge users + events
    const response = finalUsers.map((user) => {
      const userEvents = events
        .filter((event) => event.user_id === user.id)
        .map((event) => ({
          event_id: event.id,
          title: event.title,
          slug: event.slug,
          event_datetime: event.event_datetime,
          venue_name: event.venue_name,
          venue_address: event.venue_address,
          occasion_data: event.occasion_data,
        }));

      return {
        user_id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        status: user.status,
        events: userEvents,
      };
    });

    res.json({ success: true, count: response.length, page, limit, data: response });
  } catch (error) {
    console.error("Error searching users/events:", error);

    const handled = handleSequelizeError(error, res);
    if (handled) return handled;

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