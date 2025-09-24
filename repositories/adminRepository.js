import { Op, fn, col, where as sequelizeWhere } from "sequelize";
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


// repositories/adminRepository.js


// repositories/adminRepository.js


export const findAdminWithRoleAndPermissions = async ({ role, status, search }) => {
  try {
    const where = {};
    const roleWhere = {};

    // 🚩 Status filter (true/false)
    if (status !== undefined) {
      if (status === "true" || status === true) {
        where.status = true;
      } else if (status === "false" || status === false) {
        where.status = false;
      }
    }

    // 🚩 Search filter (case-insensitive across multiple fields)
    if (search) {
      const keyword = search.trim().toLowerCase();
      where[Op.or] = [
        sequelizeWhere(fn("LOWER", col("Admin.name")), { [Op.like]: `%${keyword}%` }),
        sequelizeWhere(fn("LOWER", col("Admin.email")), { [Op.like]: `%${keyword}%` }),
        sequelizeWhere(fn("LOWER", col("Admin.phone")), { [Op.like]: `%${keyword}%` }),
        sequelizeWhere(fn("LOWER", col("Admin.emp_id")), { [Op.like]: `%${keyword}%` }),
        sequelizeWhere(fn("LOWER", col("Admin.city")), { [Op.like]: `%${keyword}%` }),
        sequelizeWhere(fn("LOWER", col("Admin.address")), { [Op.like]: `%${keyword}%` }),
      ];
    }

    // 🚩 Role filter (by role_id)
    if (role) {
      roleWhere.id = role;
    }

    return await db.Admin.findAll({
      where,
      attributes: ["id", "name", "email", "emp_id", "status", "city", "address", "phone"],
      include: [
        {
          model: db.Role,
          as: "roles",
          attributes: ["id", "name", "code"],
          through: { attributes: [] },
          where: Object.keys(roleWhere).length > 0 ? roleWhere : undefined,
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
  } catch (error) {
    throw new Error(`Failed to fetch admins: ${error.message}`);
  }
};


export const findAdminById1 = (id, t) =>
  db.Admin.findByPk(id, {
    include: [
      {
        model: db.Role,
        as: "roles",
        include: [
          {
            model: db.Permission,
            as: "permissions",
          },
        ],
      },
    ],
    transaction: t,
  });


export const findAdminById2 = async (id) => {
  return await db.Admin.findByPk(id, {
    include: [{ model: db.Role, as: "roles" }],
  });
};



export const updateAdmin = async (id, updateData, transaction) => {
  return await db.Admin.update(updateData, {
    where: { id },
    returning: true,
    plain: true,
    transaction,
  });
};

export const updateAdminRoles = async (id, roleIds, transaction) => {
  const admin = await db.Admin.findByPk(id, { transaction });
  if (!admin) return null;
  await admin.setRoles(roleIds, { transaction });
  return admin;
};


export const updateAdminStatus = async (id, status, transaction) => {
  return await db.Admin.update(
    { status },
    {
      where: { id },
      returning: true,
      plain: true,
      transaction,
    }
  );
};