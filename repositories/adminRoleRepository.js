// repositories/adminRoleRepository.js
import db from "../models/index.js";

export const findAdminWithRoles = (adminId, t) =>
  db.Admin.findByPk(adminId, {
    attributes: ["id"],
    include: [{ model: db.Role, as: "Roles",attributes: ["id"]}],
    transaction: t,
  });
