import { sequelize } from "../models/index.js";
import {
  findRoleByCode,
  createRoleRepo,
  findPermissionsByNames,
  findRoleByIdWithPermissions,
  findAllRoles,
} from "../repositories/roleRepository.js";

export const createRoleService = async ({ name, code, permissions }) => {
  const t = await sequelize.transaction();
  try {
    if (!name || !code) {
      throw new Error("Name and Code are required");
    }

    const existing = await findRoleByCode(code.trim().toUpperCase(), t);
    if (existing) {
      throw new Error("Role code already exists");
    }

    const role = await createRoleRepo(
      { name, code: code.trim().toUpperCase() },
      t
    );

    if (Array.isArray(permissions) && permissions.length > 0) {
      const uniquePerms = [
        ...new Set(permissions.map((p) => p.trim().toLowerCase())),
      ];

      const foundPerms = await findPermissionsByNames(uniquePerms, t);
      if (foundPerms.length === 0) {
        throw new Error("No valid permissions found to assign");
      }

      await role.addPermissions(foundPerms, { transaction: t });
    }

    await t.commit();
    return await findRoleByIdWithPermissions(role.id);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const getAllRolesService = async () => {
  return await findAllRoles();
};
