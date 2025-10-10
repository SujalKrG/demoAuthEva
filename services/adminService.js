// services/admin.service.js
import bcrypt from "bcryptjs";
import db from "../models/index.js";
import { AdminRepository } from "../repositories/adminRepository.js";
import { logger } from "../utils/logger.js";

export const AdminService = {
  createAdmin: async (data) => {
    const t = await db.sequelize.transaction();
    try {
      const { name, email, phone, password, address, city, roles = [] } = data;

      const existing = await AdminRepository.findByEmail(email, t);
      if (existing) throw new Error("Email already exists");

      const hashedPassword = await bcrypt.hash(password, 10);
      const random = Math.floor(1000 + Math.random() * 9000);
      const emp_id = `EMP${new Date().toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}-${random}`;

      const admin = await AdminRepository.create(
        { name, email, phone, password: hashedPassword, emp_id, address, city },
        t
      );

      if (roles.length > 0) {
        await AdminRepository.assignRoles(admin.id, roles, t);
      }

      await t.commit();
      return await AdminRepository.getAdminWithRoles(admin.id);
    } catch (error) {
      await t.rollback();
      logger.error(`[createAdmin] ${error.message}`);
      throw error;
    }
  },

  getAdminWithRoleAndPermissions: async (filters) => {
    const admins = await AdminRepository.getAdminsWithRolesAndPermissions(
      filters
    );
    if (!admins || admins.length === 0) throw new Error("Admin not found");

    return admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      address: admin.address,
      city: admin.city,
      emp_id: admin.emp_id,
      status: admin.status,
      roles: admin.roles.map((role) => ({
        id: role.id,
        name: role.name,
        code: role.code,
        permissions: role.permissions.map((p) => p.name),
      })),
    }));
  },

  updateAdmin: async (id, data) => {
    const t = await db.sequelize.transaction();
    try {
      const { roles, ...adminData } = data;

      const [affectedCount] = await AdminRepository.update(id, adminData, t);
      if (affectedCount === 0) {
        await t.rollback();
        return null;
      }

      if (roles && Array.isArray(roles) && roles.length > 0) {
        const uniqueRoleIds = [...new Set(roles.map((r) => parseInt(r, 10)))];
        await AdminRepository.replaceRoles(id, uniqueRoleIds, t);
      }

      await t.commit();
      return await AdminRepository.getAdminWithRoles(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  updateAdminStatus: async (id, status) => {
    const t = await db.sequelize.transaction();
    try {
      if (status === undefined || status === null) {
        throw new Error("Status is required");
      }
      const normalizedStatus =
        status === true || status === "true" || status === 1 || status === "1";

      const [affectedCount] = await AdminRepository.updateStatus(
        id,
        normalizedStatus,
        t
      );

      if (affectedCount === 0) {
        await t.rollback();
        return null;
      }

      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },
};
