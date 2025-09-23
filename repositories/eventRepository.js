import db, { Sequelize, remoteSequelize } from "../models/index.js";
import UserModelFactory from "../models/remote/user.js";
import OccasionModelFactory from "../models/remote/occasion.js";
import { Op } from "sequelize";

const RemoteUser = UserModelFactory(remoteSequelize, Sequelize.DataTypes);
const RemoteOccasion = OccasionModelFactory(remoteSequelize, Sequelize.DataTypes);

export const getEventsRepo = async ({ whereConditions, limit, offset }) => {
  return db.Event.findAndCountAll({
    where: whereConditions,
    attributes: [
      "id", "user_id", "occasion_id", "title", "slug",
      "event_datetime", "venue_name", "venue_address",
      "occasion_data", "created_at", "updated_at", "deleted_at"
    ],
    order: [["created_at", "desc"]],
    limit,
    offset,
    paranoid: false, // include soft-deleted
  });
};

export const getUsersByIds = async (userIds) => {
  return RemoteUser.findAll({
    where: { id: { [Op.in]: userIds } },
    attributes: ["id", "name", "mobile"],
  });
};

export const getOccasionsByIds = async (occasionIds) => {
  return RemoteOccasion.findAll({
    where: { id: { [Op.in]: occasionIds } },
    attributes: ["id", "name"],
  });
};

export const searchRemoteUsers = async (searchValue) => {
  const users = await RemoteUser.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${searchValue}%` } },
        { mobile: { [Op.like]: `%${searchValue}%` } },
      ],
    },
    attributes: ["id"],
  });
  return users.map((u) => u.id);
};
