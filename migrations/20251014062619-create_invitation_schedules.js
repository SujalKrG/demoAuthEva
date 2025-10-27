"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("invitation_schedules", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      event_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      user_theme_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },

      // --- Schedule & Channel Info ---
      guest_schedule_channel: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      currency_code: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: "INR",
      },

      // --- Price Summary ---
      base_price: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      total_guests: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_messages: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      channel_breakdown: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      // --- Coupon / Discounts ---
      coupon_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      coupon_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      coupon_discount: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      // --- Tax / Charges ---
      tax_amount: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        // defaultValue: 0.0,
      },
      service_charge: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        // defaultValue: 0.0,
      },
      net_amount: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      // --- Wallet / Payment Info ---
      wallet_used: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      wallet_transaction_id: {
        //ref to wallet transaction table
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      payable_after_wallet: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      amount_breakdown: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      payment_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },

      // --- Status ---
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0=pending, 1=scheduled, 2=canceled",
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("invitation_schedules");
  },
};
