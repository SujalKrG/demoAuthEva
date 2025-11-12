"use strict";
import bcrypt from "bcryptjs";

export default {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // === 1️⃣ Insert Roles (safe reference data)
    const roles = [
      {
        name: "Super Admin",
        code: "SUPER_ADMIN",
        created_at: now,
        updated_at: now,
      },
    ];
    await queryInterface.bulkInsert("roles", roles, {});

    // === 2️⃣ Create Admin (from .env)
    const adminEmail = process.env.SUPERADMIN_EMAIL;
    const adminPassword = process.env.SUPERADMIN_PASSWORD;
    const adminName = "Alok"

    if (!adminEmail || !adminPassword) {
      console.warn(
        "⚠️  SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set in .env — skipping admin creation."
      );
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 10);

      // Check if admin already exists
      const existingAdmins = await queryInterface.sequelize.query(
        `SELECT id FROM admins WHERE email = :email LIMIT 1`,
        {
          replacements: { email: adminEmail },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      let adminId;
      if (existingAdmins.length === 0) {
        // Insert new admin
        await queryInterface.bulkInsert("admins", [
          {
            name: adminName,
            email: adminEmail,
            phone: "8018375795",
            password: passwordHash,
            emp_id: "EMP001",
            status: true,
            created_at: now,
            updated_at: now,
          },
        ]);

        const insertedAdmins = await queryInterface.sequelize.query(
          `SELECT id FROM admins WHERE email = :email`,
          {
            replacements: { email: adminEmail },
            type: Sequelize.QueryTypes.SELECT,
          }
        );
        adminId = insertedAdmins[0]?.id;
      } else {
        adminId = existingAdmins[0].id;
      }

      // === 3️⃣ Assign Role to Admin (pivot)
      const rolesData = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE code = 'SUPER_ADMIN' LIMIT 1`
      );
      const roleId = rolesData[0]?.[0]?.id;

      if (roleId && adminId) {
        const existing = await queryInterface.sequelize.query(
          `SELECT id FROM admin_roles WHERE admin_id = :adminId AND role_id = :roleId`,
          {
            replacements: { adminId, roleId },
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        if (existing.length === 0) {
          await queryInterface.bulkInsert("admin_roles", [
            {
              admin_id: adminId,
              role_id: roleId,
              created_at: now,
              updated_at: now,
            },
          ]);
        }
      }
    }

    // === 4️⃣ Guest Groups
    const guestGroups = [
      { user_id: null, name: "Friends", created_at: now, updated_at: now },
      { user_id: null, name: "Family", created_at: now, updated_at: now },
      { user_id: null, name: "Colleagues", created_at: now, updated_at: now },
    ];
    await queryInterface.bulkInsert("guest_groups", guestGroups, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("admin_roles", null, {});
    await queryInterface.bulkDelete("admins", null, {});
    await queryInterface.bulkDelete("roles", null, {});
    await queryInterface.bulkDelete("guest_groups", null, {});
  },
};
