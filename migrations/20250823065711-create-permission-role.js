"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("permission_roles", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      permissionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "permissions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    await queryInterface.addConstraint("permission_roles", {
      fields: ["roleId", "permissionId"],
      type: "unique",
      name: "uniq_permission_roles_roleId_permissionId",
    });

    //Adding indexes
    await queryInterface.addIndex("permission_roles", ["roleId"], {
      name: "idx_permission_roles_roleId",
    });

    await queryInterface.addIndex("permission_roles", ["permissionId"], {
      name: "idx_permission_roles_permissionId",
    });
  },

  async down(queryInterface, Sequelize) {
    //Remove indexes explicitly
    await queryInterface.removeIndex(
      "permission_roles",
      "idx_permission_roles_roleId"
    );

    await queryInterface.removeIndex(
      "permission_roles",
      "idx_permission_roles_permissionId"
    );

    //Remove unique constraints explicitly
    await queryInterface.removeConstraint(
      "permission_roles",
      "uniq_permission_roles_roleId_permissionId"
    );

    await queryInterface.dropTable("permission_roles");
  },
};
