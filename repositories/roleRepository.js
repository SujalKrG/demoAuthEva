import db from "../models/index.js";
import { Op } from "sequelize";

export const findRoleByCode = (code, t) =>
  db.Role.findOne({ where: { code }, transaction: t });

export const createRoleRepo = (data, t) =>
  db.Role.create(data, { transaction: t });

export const findPermissionsByIds = (ids, transaction) =>
  db.Permission.findAll({
    where: { id: { [Op.in]: ids } },
    transaction,
  });
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


  
export const findRoleById = (id, transaction) =>
  db.Role.findByPk(id, { transaction });

export const updateRole = async (id, updateData, transaction) => {
  return await db.Role.update(updateData, {
    where: { id },
    returning: true,
    plain: true,
    transaction,
  });
};



export const findRoleByIdWithPermissions1 = async (id, transaction) => {
  return await db.Role.findByPk(id, {
    include: [
      {
        model: db.Permission,
        as: "permissions",
        attributes: ["id", "name"],
        through: { attributes: [] },
      },
    ],
    transaction,
  });
};

export const updateRoleRepo = async (id, roleData, transaction) => {
  return await db.Role.update(roleData, {
    where: { id },
    returning: true,
    plain: true,
    transaction,
  });
};

export const updateRolePermissionsRepo = async (role, newPermissionIds, transaction) => {
  // Get currently assigned permissions
  const currentPermissions = await role.getPermissions({ transaction });
  const currentIds = currentPermissions.map((p) => p.id);

  // Calculate additions & removals
  const toAdd = newPermissionIds.filter((id) => !currentIds.includes(id));
  const toRemove = currentIds.filter((id) => !newPermissionIds.includes(id));

  // Perform updates
  if (toAdd.length > 0) {
    await role.addPermissions(toAdd, { transaction });
  }
  if (toRemove.length > 0) {
    await role.removePermissions(toRemove, { transaction });
  }

  return {
    added: toAdd,
    removed: toRemove,
    alreadyAssigned: newPermissionIds.filter((id) => currentIds.includes(id)),
  };
};
