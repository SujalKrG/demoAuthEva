import { sequelize } from "../models/index.js";
import { findRoleById, findPermissionById } from "../repositories/rolePermissionRepository.js";

export const assignPermissionToRoleService = async ({ roleId, permissionId }) => {
  const t = await sequelize.transaction();
  try {
    const role = await findRoleById(roleId, t);
    const permission = await findPermissionById(permissionId, t);

    if (!role || !permission) {
      throw new Error("Role or Permission not found");
    }

    const alreadyHasPermission = await role.hasPermission(permission, { transaction: t });
    if (alreadyHasPermission) {
      throw new Error("Role already has this permission");
    }

    await role.addPermission(permission, { transaction: t });
    await t.commit();

    return { message: `Permission ${permission.name} assigned to role ${role.code}` };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
