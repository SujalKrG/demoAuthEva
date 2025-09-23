import db from "../models/index.js";

export const findAdminById = (id, t) =>
  db.Admin.findByPk(id, { transaction: t });

export const findRoleById = (id, t) =>
  db.Role.findByPk(id, { transaction: t });
