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
    await queryInterface.bulkInsert("roles", roles, {});

    // 2️⃣ Insert Permissions
    const permissions = [
      { name: "create_post", createdAt: new Date(), updatedAt: new Date() },
      { name: "edit_post", createdAt: new Date(), updatedAt: new Date() },
      { name: "delete_post", createdAt: new Date(), updatedAt: new Date() },
      { name: "view_post", createdAt: new Date(), updatedAt: new Date() },
    ];
    await queryInterface.bulkInsert("permissions", permissions, {});

    // 3️⃣ Insert Admins (with all required fields)
    const passwordHash = await bcrypt.hash("dummy123", 10); // hashed password
    const admins = [
      {
        username: "Alice",
        email: "alice@test.com",
        phone: "1234567890",
        password: passwordHash,
        emp_id: "EMP001",
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "Bob",
        email: "bob@test.com",
        phone: "0987654321",
        password: passwordHash,
        emp_id: "EMP002",
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
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
      `SELECT id, username FROM admins;`
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
      acc[a.username] = a.id;
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
    await queryInterface.bulkInsert("permission_roles", permissionRoles, {});

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
    await queryInterface.bulkInsert("role_admins", roleAdmins, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("role_admins", null, {});
    await queryInterface.bulkDelete("permission_roles", null, {});
    await queryInterface.bulkDelete("admins", null, {});
    await queryInterface.bulkDelete("permissions", null, {});
    await queryInterface.bulkDelete("roles", null, {});
  },
};
