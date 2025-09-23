import db from "../models/index.js";

export const findAdminByEmail = (email) => 
  db.Admin.findOne({
    where: { email },
    include: [
      {
        model: db.Role,
        as: "roles",
        attributes: ["code"],
        include: [
          { model: db.Permission, as: "permissions", attributes: ["name"], through: { attributes: [] } },
        ],
      },
    ],
  });

export const findAdminById = (id) => db.Admin.findByPk(id);

export const saveAdmin = (admin) => admin.save();
