"use strict";
import bcrypt from "bcryptjs";

export default {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Insert Roles
    const roles = [
      {
        name: "Super Admin",
        code: "SUPER_ADMIN",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    await queryInterface.bulkInsert("roles", roles, {});

    // 3️⃣ Insert Admins (with all required fields)
    const passwordHash = await bcrypt.hash("dummy123", 10); // hashed password
    const admins = [
      {
        name: "Alok",
        email: "kumaraloka7205@gmail.com",
        phone: "8018375795",
        password: passwordHash,
        emp_id: "EMP001",
        status: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    await queryInterface.bulkInsert("admins", admins, {});

    // 4️⃣ Get inserted roles, permissions, admins IDs
    const insertedRoles = await queryInterface.sequelize.query(
      `SELECT id, code FROM roles;`
    );
    const insertedPermissions = await queryInterface.sequelize.query(
      `SELECT id, name FROM permissions;`
    );
    const insertedAdmins = await queryInterface.sequelize.query(
      `SELECT id, name FROM admins;`
    );

    const rolesMap = insertedRoles[0].reduce((acc, r) => {
      acc[r.code] = r.id;
      return acc;
    }, {});
    const permsMap = insertedPermissions[0].reduce((acc, p) => {
      acc[p.name] = p.id;
      return acc;
    }, {});
    const adminsMap = insertedAdmins[0].reduce((acc, a) => {
      acc[a.name] = a.id;
      return acc;
    }, {});

    // 5️⃣ Assign Permissions to Roles (pivot table)

    // 6️⃣ Assign Roles to Admins (pivot table)
    const adminRoles = [
      {
        admin_id: adminsMap["Alok"],
        role_id: rolesMap["SUPER_ADMIN"],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    await queryInterface.bulkInsert("admin_roles", adminRoles, {});

    const guestGroups = [
      {
        user_id: null,
        name: "Friends",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: null,
        name: "Family",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: null,
        name: "Colleagues",
        created_at: new Date(),
        updated_at: new Date(),
      },
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
