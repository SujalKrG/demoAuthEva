import db from "../models/index.js";
import { Op } from "sequelize";

export const findPermissionsByNames = (names) =>
  db.Permission.findAll({
    where: { name: { [Op.in]: names } },
  });

export const bulkCreatePermissions = (names) =>
  db.Permission.bulkCreate(names.map((n) => ({ name: n })));

export const getAllPermissions = () =>
  db.Permission.findAll({ attributes: ["id", "name"] });