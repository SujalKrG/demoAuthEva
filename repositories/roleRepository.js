import db from "../models/index.js";
import { Op } from "sequelize";

// Role CRUD
export const findRoleByCode = (code, t) =>
  db.Role.findOne({ where: { code }, transaction: t });

export const createRoleRepo = (data, t) =>
  db.Role.create(data, { transaction: t });

export const findPermissionsByIds = (ids, transaction) =>
  db.Permission.findAll({
    where: { id: { [Op.in]: ids } },
    transaction,
  });

export const findRoleByIdWithPermissions = (id, transaction) =>
  db.Role.findByPk(id, {
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

// Update role fields
export const updateRoleRepo = (id, roleData, transaction) =>
  db.Role.update(roleData, {
    where: { id },
    returning: true,
    plain: true,
    transaction,
  });

// Sync role permissions efficiently
export const updateRolePermissionsRepo = async (
  role,
  newPermissionIds,
  transaction
) => {
  const currentIds = (await role.getPermissions({ transaction })).map(
    (p) => p.id
  );

  // Sequelize setPermissions will handle add/remove automatically
  await role.setPermissions(newPermissionIds, { transaction });

  return {
    added: newPermissionIds.filter((id) => !currentIds.includes(id)),
    removed: currentIds.filter((id) => !newPermissionIds.includes(id)),
    alreadyAssigned: newPermissionIds.filter((id) => currentIds.includes(id)),
  };
};
export const findAllRoles = () =>
  db.Role.findAll({
    attributes: ["id", "name", "code"],
    include: [
      {
        model: db.Permission,
        as: "permissions",
        attributes: ["id", "name", "permission_code"],
        through: { attributes: [] },
      },
    ],
  });
