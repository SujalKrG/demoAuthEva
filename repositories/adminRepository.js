import db from "../models/index.js";

export const findAdminByEmail = (email, t) =>
  db.Admin.findOne({ where: { email }, transaction: t });

export const createAdmin = (data, t) =>
  db.Admin.create(data, { transaction: t });

export const findRoleByCodes = (codes, t) =>
  db.Role.findAll({ where: { code: codes }, transaction: t });

export const findAdminByIdWithRoles = (id) =>
  db.Admin.findByPk(id, {
    attributes: { exclude: ["password"] },
    include: [
      { model: db.Role, as: "roles", attributes: ["id", "name", "code"] },
    ],
  });

export const findAllAdmins = () =>
  db.Admin.findAll({ attributes: { exclude: ["password"] } });

export const findAdminById = (id) =>
  db.Admin.findByPk(id, { attributes: { exclude: ["password"] } });

export const findAdminWithRoleAndPermissions = () =>
  db.Admin.findAll({
    attributes: [
      "id",
      "name",
      "email",
      "emp_id",
      "status",
      "city",
      "address",
      "phone",
    ],
    include: [
      {
        model: db.Role,
        as: "roles",
        attributes: ["id", "name", "code"],
        through: { attributes: [] },
        include: [
          {
            model: db.Permission,
            as: "permissions",
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
        ],
      },
    ],
  });
