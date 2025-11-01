import db, { remoteSequelize } from "../models/index.js";
import userModelFactory from "../models/remote/user.js";

const { UserTheme, Theme, Event, Sequelize } = db;
const { Op } = Sequelize;

// Remote User model
const UserModel = userModelFactory(remoteSequelize, Sequelize.DataTypes);

/**
 * Fetch paginated user themes from main DB
 */
export const getUserThemeRepo = async (filters = {}) => {
  const { limit, offset } = filters;
  const whereClause = {};

  // Filter by user_id
  if (filters.user_id) {
    whereClause.user_id = filters.user_id;
  }

  // Filter by purchase status
  if (filters.status) {
    if (filters.status === "purchased") {
      whereClause.purchased_price = 0;
    } else if (filters.status === "not_purchased") {
      whereClause.purchased_price = { [Op.gt]: 0 };
    }
  }

  // Query with pagination
  const { rows, count } = await UserTheme.findAndCountAll({
    where: whereClause,
    include: [
      { model: Theme, as: "theme", attributes: ["id", "name"] },
      { model: Event, as: "event", attributes: ["id", "title"] },
    ],
    order: [["created_at", "DESC"]],
    limit: limit || 10,
    offset: offset || 0,
  });

  return { rows, count };
};

/**
 * Fetch users from remote DB by IDs
 */
export const getUsersByIdsRepo = async (userIds = []) => {
  if (!userIds.length) return [];

  return await UserModel.findAll({
    where: { id: userIds },
    attributes: ["id", "name", "email"],
    raw: true,
  });
};
