"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("invoices", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      invitation_payment_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "invitation_payments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },

      invoice_number: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },

      invoice_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      gst_percentage: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 18,
      },

      amount_without_gst: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      gst_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      total_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      currency_code: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: "INR",
      },

      invoice_status: {
        type: Sequelize.ENUM("draft", "issued", "cancelled"),
        allowNull: false,
        defaultValue: "issued",
      },

      notes: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      billing_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      billing_address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      gstin: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },

      tax_breakdown: {
        type: Sequelize.JSON,
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
    await queryInterface.dropTable("invoices");
  },
};
