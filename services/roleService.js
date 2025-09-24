import { sequelize } from "../models/index.js";
import {
  findRoleByCode,
  createRoleRepo,
  // findPermissionsByNames,
  findRoleByIdWithPermissions,
  findPermissionsByIds,
  findAllRoles,
  findRoleByIdWithPermissions1,
  updateRoleRepo,
  updateRolePermissionsRepo,
} from "../repositories/roleRepository.js";
import { logger } from "../utils/logger.js";

// 🔹 Create Role with Permissions
export const createRoleService = async ({ name, code, permissions }) => {
  const t = await sequelize.transaction();
  try {
    if (!name || !code) {
      throw new Error("Name and Code are required");
    }

    const normalizedCode = code.trim().toUpperCase();
    const existing = await findRoleByCode(normalizedCode, t);
    if (existing) {
      throw new Error("Role code already exists");
    }

    const role = await createRoleRepo(
      { name: name.trim(), code: normalizedCode },
      t
    );
    if (Array.isArray(permissions) && permissions.length > 0) {
      const uniqueIds = [...new Set(permissions.map((p) => parseInt(p, 10)))];

      const foundPerms = await findPermissionsByIds(uniqueIds, t);
      if (foundPerms.length === 0) {
        throw new Error("No valid permissions found to assign");
      }

      await role.addPermissions(foundPerms, { transaction: t });
    }

    await t.commit();
    return await findRoleByIdWithPermissions(role.id);
  } catch (error) {
    await t.rollback();
    logger.error(`[createRoleService] ${error.message}`);
    throw error;
  }
};

// 🔹 Get all Roles
export const getAllRolesService = async () => {
  return await findAllRoles();
};

export const updateRoleWithPermissionsService = async (id, data) => {
  const t = await sequelize.transaction();
  try {
    const { permissions, ...roleData } = data;

    // 🚩 Find role
    const role = await findRoleByIdWithPermissions1(id, t);
    if (!role) {
      await t.rollback();
      return { error: "Role not found", status: 404 };
    }

    // 🚩 Update role fields (if provided)
    if (Object.keys(roleData).length > 0) {
      await updateRoleRepo(id, roleData, t);
    }

    let permissionUpdateResult = null;

    // 🚩 Update permissions (sync to exactly match provided array)
    if (Array.isArray(permissions)) {
      permissionUpdateResult = await updateRolePermissionsRepo(
        role,
        permissions,
        t
      );
    }

    await t.commit();

    // Return updated role with permissions
    const updatedRole = await findRoleByIdWithPermissions1(id);
    return {
      message: "Role updated successfully",
      role: updatedRole,
      permissionUpdateResult,
    };
  } catch (error) {
    await t.rollback();
    throw new Error(`Service error: ${error.message}`);
  }
};
