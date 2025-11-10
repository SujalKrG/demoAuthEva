// repositories/admin.repository.js
import db from "../models/index.js";
import { Op, fn, col, where as sequelizeWhere } from "sequelize";

export const AdminRepository = {
  findByEmail: async (email, transaction) =>
    db.Admin.findOne({ where: { email }, transaction }),

  create: async (data, transaction) =>
    db.Admin.create(data, { transaction }),

  assignRoles: async (adminId, roleIds, transaction) => {
    const records = roleIds.map((roleId) => ({
      admin_id: adminId,
      role_id: roleId,
    }));
    return db.AdminRole.bulkCreate(records, { transaction });
  },

  getAdminWithRoles: async (id, transaction) =>
    db.Admin.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: db.Role,
          as: "roles",
          attributes: ["id", "name", "code"],
          through: { attributes: [] },
        },
      ],
      transaction,
    }),

  getAdminsWithRolesAndPermissions: async ({ role, status, search }) => {
    const where = {};
    const roleWhere = {};

    if (status !== undefined) {
      where.status = status === true || status === "true";
    }

    if (search) {
      const keyword = search.trim().toLowerCase();
      where[Op.or] = [
        sequelizeWhere(fn("LOWER", col("Admin.name")), {
          [Op.like]: `%${keyword}%`,
        }),
        sequelizeWhere(fn("LOWER", col("Admin.email")), {
          [Op.like]: `%${keyword}%`,
        }),
        sequelizeWhere(fn("LOWER", col("Admin.phone")), {
          [Op.like]: `%${keyword}%`,
        }),
        sequelizeWhere(fn("LOWER", col("Admin.emp_id")), {
          [Op.like]: `%${keyword}%`,
        }),
        sequelizeWhere(fn("LOWER", col("Admin.city")), {
          [Op.like]: `%${keyword}%`,
        }),
        sequelizeWhere(fn("LOWER", col("Admin.address")), {
          [Op.like]: `%${keyword}%`,
        }),
      ];
    }

    if (role) {
      roleWhere.id = role;
    }

    return db.Admin.findAll({
      where,
      attributes: [
        "id",
        "name",
        "email",
        "emp_i",
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
          where: Object.keys(roleWhere).length ? roleWhere : undefined,
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
  },

  update: async (id, updateData, transaction) =>
    db.Admin.update(updateData, {
      where: { id },
      returning: true,
      transaction,
    }),

  replaceRoles: async (id, roleIds, transaction) => {
    await db.AdminRole.destroy({ where: { admin_id: id }, transaction });
    const newRoleMappings = roleIds.map((rid) => ({
      admin_id: id,
      role_id: rid,
    }));
    return db.AdminRole.bulkCreate(newRoleMappings, { transaction });
  },

  updateStatus: async (id, status, transaction) =>
    db.Admin.update(
      { status },
      { where: { id }, returning: true, transaction }
    ),
};
