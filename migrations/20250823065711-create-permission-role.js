"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("permission_role", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "role",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      permissionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "permission",
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

    await queryInterface.addConstraint("permission_role", {
      fields: ["roleId", "permissionId"],
      type: "unique",
      name: "uniq_permission_role_roleId_permissionId",
    });

    //Adding indexes
    await queryInterface.addIndex("permission_role", ["roleId"], {
      name: "idx_permission_role_roleId",
    });

    await queryInterface.addIndex("permission_role", ["permissionId"], {
      name: "idx_permission_role_permissionId",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("permission_role");
  },
};
