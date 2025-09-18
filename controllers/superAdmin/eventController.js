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
    const { page = 1, limit = 10, q, occasion, user } = req.query;
    const offset = (page - 1) * limit;

    if (!db.Event) {
      throw new Error("Event model is not initialized");
    }

    const whereConditions = {};
    if (occasion) {
      whereConditions.occasion_id = occasion;
    }
    if (user) {
      whereConditions.user_id = user;
    }

    if (q && q.trim() !== "") {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { slug: { [Op.like]: `%${q}%` } },
        { venue_name: { [Op.like]: `%${q}%` } },
        { venue_address: { [Op.like]: `%${q}%` } },
        Sequelize.where(
          Sequelize.fn("JSON_UNQUOTE", Sequelize.col("occasion_data")),
          { [Op.like]: `%${q}%` }
        ),
      ];
    }
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
        "deleted_at",
      ],
      order: [["created_at", "desc"]],
      limit: parseInt(limit),
      offset,
    });

    if (events.length === 0 || !events) {
      return res.status(404).json({
        success: false,
        message: "Events not found",
      });
    }

    const userIds = events.map((e) => e.user_id).filter(Boolean);
    const occasionsIds = events.map((e) => e.occasion_id).filter(Boolean);

    const users = await RemoteOccasion.findAll({
      where: { id: { [Op.in]: occasionsIds } },
      attributes: ["id", "name"],
    });
    const occasions = await RemoteUser.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ["id", "name", "mobile"],
    });
    const userMap = users.reduce((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {});

    const occasionMap = occasions.reduce((acc, o) => {
      acc[o.id] = o;
      return acc;
    }, {});

    const result = events.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      event_datetime: e.event_datetime,
      venue_name: e.venue_name,
      venue_address: e.venue_address,
      occasion_data: e.occasion_data,
      user: userMap[e.user_id] || null,
      occasion: occasionMap[e.occasion_id] || null,
      created_at: e.created_at,
      deleted_at: e.deleted_at,
    }));
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

