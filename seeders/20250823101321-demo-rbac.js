"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Insert Roles
    const roles = [
      {
        name: "Super Admin",
        code: "SUPER_ADMIN",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Editor",
        code: "EDITOR",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Viewer",
        code: "VIEWER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await queryInterface.bulkInsert("role", roles, {});

    // 2️⃣ Insert Permissions
    const permissions = [
      { name: "create_post", createdAt: new Date(), updatedAt: new Date() },
      { name: "edit_post", createdAt: new Date(), updatedAt: new Date() },
      { name: "delete_post", createdAt: new Date(), updatedAt: new Date() },
      { name: "view_post", createdAt: new Date(), updatedAt: new Date() },
    ];
    await queryInterface.bulkInsert("permission", permissions, {});

    // 3️⃣ Insert Admins (with all required fields)
    const passwordHash = await bcrypt.hash("dummy123", 10); // hashed password
    const admins = [
      {
        name: "Alice",
        email: "alice@test.com",
        phone: "1234567890",
        password: passwordHash,
        emp_id: "EMP001",
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Bob",
        email: "bob@test.com",
        phone: "0987654321",
        password: passwordHash,
        emp_id: "EMP002",
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await queryInterface.bulkInsert("admin", admins, {});

    // 4️⃣ Get inserted roles, permissions, admins IDs
    const insertedRoles = await queryInterface.sequelize.query(
      `SELECT id, code FROM role;`
    );
    const insertedPermissions = await queryInterface.sequelize.query(
      `SELECT id, name FROM permission;`
    );
    const insertedAdmins = await queryInterface.sequelize.query(
      `SELECT id, name FROM admin;`
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
    const permissionRoles = [
      {
        roleId: rolesMap["SUPER_ADMIN"],
        permissionId: permsMap["create_post"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: rolesMap["SUPER_ADMIN"],
        permissionId: permsMap["edit_post"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: rolesMap["SUPER_ADMIN"],
        permissionId: permsMap["delete_post"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: rolesMap["SUPER_ADMIN"],
        permissionId: permsMap["view_post"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        roleId: rolesMap["EDITOR"],
        permissionId: permsMap["edit_post"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: rolesMap["EDITOR"],
        permissionId: permsMap["view_post"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        roleId: rolesMap["VIEWER"],
        permissionId: permsMap["view_post"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await queryInterface.bulkInsert("permission_role", permissionRoles, {});

    // 6️⃣ Assign Roles to Admins (pivot table)
    const roleAdmins = [
      {
        adminId: adminsMap["Alice"],
        roleId: rolesMap["SUPER_ADMIN"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        adminId: adminsMap["Bob"],
        roleId: rolesMap["EDITOR"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await queryInterface.bulkInsert("role_admin", roleAdmins, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("role_admin", null, {});
    await queryInterface.bulkDelete("permission_role", null, {});
    await queryInterface.bulkDelete("admin", null, {});
    await queryInterface.bulkDelete("permission", null, {});
    await queryInterface.bulkDelete("role", null, {});
  },
};
