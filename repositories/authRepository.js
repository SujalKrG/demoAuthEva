import db from "../models/index.js";

export const findAdminByEmail = (email) =>
  db.Admin.findOne({
    where: { email },
    attributes: ["id", "email", "password", "status", "name"],
    include: [
      {
        model: db.Role,
        as: "roles",
        attributes: ["code"],
        include: [
          {
            model: db.Permission,
            as: "permissions",
            attributes: ["name"],
            through: { attributes: [] },
          },
        ],
      },
    ],
  });

export const findAdminById = (id) =>
  db.Admin.findByPk(id, { attributes: ["id", "password"] });

export const saveAdmin = (admin) => admin.save();

export const findAdminById1 = async (id) => {
  return await db.Admin.findByPk(id, {
    attributes: ["id", "name", "email"],
    include: [
      {
        model: db.Role,
        as: "roles",
        include: [{ model: db.Permission, as: "permissions" }],
      },
    ],
  });
};
