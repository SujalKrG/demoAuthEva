import db from "../models/index.js";

export const findRoleById = (id, t) => 
  db.Role.findByPk(id, { transaction: t });

export const findPermissionById = (id, t) =>
  db.Permission.findByPk(id, { transaction: t });
