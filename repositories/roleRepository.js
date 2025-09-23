import db from "../models/index.js";

export const findRoleByCode = (code, t) =>
  db.Role.findOne({ where: { code }, transaction: t });

export const createRoleRepo = (data, t) =>
  db.Role.create(data, { transaction: t });

export const findPermissionsByNames = (names, t) =>
  db.Permission.findAll({ where: { name: names }, transaction: t });

export const findRoleByIdWithPermissions = (id) =>
  db.Role.findByPk(id, {
    include: [{ model: db.Permission, as: "permissions" }],
  });

export const findAllRoles = () =>
  db.Role.findAll({
    attributes: ["id", "name", "code"],
    include: [
      {
        model: db.Permission,
        attributes: ["id", "name"],
        as: "permissions",
        through: { attributes: [] },
      },
    ],
  });
