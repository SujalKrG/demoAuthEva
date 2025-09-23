import { sequelize } from "../models/index.js";
import { findAdminById, findRoleById } from "../repositories/adminRoleRepository.js";

export const assignRoleToAdminService = async ({ adminId, roleId }) => {
  const t = await sequelize.transaction();
  try {
    const admin = await findAdminById(adminId, t);
    const role = await findRoleById(roleId, t);

    if (!admin || !role) {
      throw new Error("Admin or Role not found");
    }

    const alreadyHasRole = await admin.hasRole(role, { transaction: t });
    if (alreadyHasRole) {
      throw new Error("Admin already has this role");
    }

    await admin.addRole(role, { transaction: t });
    await t.commit();

    return { message: `Role ${role.code} assigned to ${admin.name}` };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
