import { sequelize } from "../models/index.js";
import {
  findRoleByCode,
  createRoleRepo,
  findPermissionsByIds,
  findRoleByIdWithPermissions,
  updateRolePermissionsRepo,
  updateRoleRepo,
  findAllRoles,
} from "../repositories/roleRepository.js";
import { logger } from "../utils/logger.js";

// 🔹 Create Role with Permissions

export const createRoleService = async ({ name, code, permissions }) => {
  const t = await sequelize.transaction();
  try {
    if (!name || !code) throw new Error("Name and Code are required");

    const normalizedCode = code.trim().toUpperCase();

    // 🚀 Check duplicate code
    const existing = await findRoleByCode(normalizedCode, t);
    if (existing) throw new Error("Role code already exists");

    // 🚀 Create role
    const role = await createRoleRepo({ name: name.trim(), code: normalizedCode }, t);

    // 🚀 Assign permissions if provided
    if (Array.isArray(permissions) && permissions.length > 0) {
      const uniqueIds = [...new Set(permissions.map(p => parseInt(p, 10)))];
      const foundPerms = await findPermissionsByIds(uniqueIds, t);
      if (foundPerms.length === 0) throw new Error("No valid permissions found");

      // Efficiently attach permissions
      await role.setPermissions(foundPerms, { transaction: t });
    }

    await t.commit();

    // Return role with permissions in one query
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

    // 🚀 Fetch role with permissions in transaction
    const role = await findRoleByIdWithPermissions(id, t);
    if (!role) {
      await t.rollback();
      return { error: "Role not found", status: 404 };
    }

    // 🚀 Update role fields if any
    if (Object.keys(roleData).length > 0) {
      await updateRoleRepo(id, roleData, t);
    }

    // 🚀 Update permissions efficiently
    let permissionUpdateResult = null;
    if (Array.isArray(permissions)) {
      const uniqueIds = [...new Set(permissions.map(p => parseInt(p, 10)))];
      permissionUpdateResult = await updateRolePermissionsRepo(role, uniqueIds, t);
    }

    await t.commit();

    // Attach updated permissions in-memory to avoid extra fetch
    const updatedRole = { ...role.get({ plain: true }) };
    if (permissions) updatedRole.permissions = await role.getPermissions();

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