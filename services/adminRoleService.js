// services/adminRoleService.js
import { sequelize } from "../models/index.js";
import { findAdminWithRoles } from "../repositories/adminRoleRepository.js";

export const assignRoleToAdminService = async ({ adminId, roleId }) => {
  const t = await sequelize.transaction();
  try {
    const admin = await findAdminWithRoles(adminId, t);

    if (!admin) {
      throw new Error("Admin not found");
    }

    // check role in one go
    const alreadyHasRole = admin.Roles.some((role) => role.id === roleId);
    if (alreadyHasRole) {
      throw new Error("Admin already has this role");
    }

    // we don't need to fetch role separately, just attach by id
    await admin.addRole(roleId, { transaction: t });
    await t.commit();

    return { message: `Role ${roleId} assigned to ${admin.name}` };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
