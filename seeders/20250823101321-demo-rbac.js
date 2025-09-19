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
      {
        name: "Editor",
        code: "EDITOR",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Viewer",
        code: "VIEWER",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    await queryInterface.bulkInsert("roles", roles, {});

    // 2️⃣ Insert Permissions
    const permissions = [
      { name: "create_post", created_at: new Date(), updated_at: new Date() },
      { name: "edit_post", created_at: new Date(), updated_at: new Date() },
      { name: "delete_post", created_at: new Date(), updated_at: new Date() },
      { name: "view_post", created_at: new Date(), updated_at: new Date() },
    ];
    await queryInterface.bulkInsert("permissions", permissions, {});

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
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Bob",
        email: "bob@test.com",
        phone: "0987654321",
        password: passwordHash,
        emp_id: "EMP002",
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
    const RolePermissions = [
      {
        role_id: rolesMap["SUPER_ADMIN"],
        permission_id: permsMap["create_post"],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: rolesMap["SUPER_ADMIN"],
        permission_id: permsMap["edit_post"],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: rolesMap["SUPER_ADMIN"],
        permission_id: permsMap["delete_post"],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: rolesMap["SUPER_ADMIN"],
        permission_id: permsMap["view_post"],
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        role_id: rolesMap["EDITOR"],
        permission_id: permsMap["edit_post"],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: rolesMap["EDITOR"],
        permission_id: permsMap["view_post"],
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        role_id: rolesMap["VIEWER"],
        permission_id: permsMap["view_post"],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    await queryInterface.bulkInsert("role_permissions", RolePermissions, {});

    // 6️⃣ Assign Roles to Admins (pivot table)
    const adminRoles = [
      {
        admin_id: adminsMap["Alice"],
        role_id: rolesMap["SUPER_ADMIN"],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        admin_id: adminsMap["Bob"],
        role_id: rolesMap["EDITOR"],
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
    await queryInterface.bulkDelete("role_permissions", null, {});
    await queryInterface.bulkDelete("admins", null, {});
    await queryInterface.bulkDelete("permissions", null, {});
    await queryInterface.bulkDelete("roles", null, {});
    await queryInterface.bulkDelete("guest_groups", null, {});
  },
};
