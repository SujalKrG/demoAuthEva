"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("invitation_payments", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },

      payment_type: {
        type: Sequelize.ENUM("invitation", "theme", "wallet_topup"),
        allowNull: false,
      },

      reference_id: { // theme purchase we can place theme_id
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "themes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      payment_mode: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },

      gateway_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      gateway_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      gateway_payment_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      gateway_response: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM("pending", "completed", "failed", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },

      refund_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: null,
      },

      refund_status: {
        type: Sequelize.ENUM("pending", "completed", "failed", "cancelled"),
        allowNull: true,
        defaultValue: null,
      },

      refund_response: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      refunded_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("invitation_payments");
  },
};
