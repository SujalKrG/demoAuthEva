"use strict";

export default (sequelize, DataTypes) => {
  const InvitationSchedule = sequelize.define(
    "InvitationSchedule",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      // --- Relations ---
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      event_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      user_theme_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },

      // --- Schedule & Channel Info ---
      guest_schedule_channel: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: "Channel-wise guest scheduling details (WhatsApp/SMS/etc)",
      },
      currency_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "INR",
      },

      // --- Price Summary ---
      base_price: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      total_guests: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_messages: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      channel_breakdown: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Stores channel-wise pricing breakdown",
      },

      // --- Coupon / Discounts ---
      coupon_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      coupon_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      coupon_discount: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      // --- Tax / Charges ---
      tax_amount: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      service_charge: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      net_amount: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      // --- Wallet / Payment Info ---
      wallet_used: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      wallet_transaction_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      payable_after_wallet: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      amount_breakdown: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Detailed breakdown of charges, taxes, discounts, wallet, etc",
      },
      payment_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },

      // --- Status ---
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0=pending, 1=scheduled, 2=canceled",
      },
    },
    {
      sequelize,
      modelName: "InvitationSchedule",
      tableName: "invitation_schedules",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true, // Enables soft delete using deleted_at
      deletedAt: "deleted_at",
    }
  );
  return InvitationSchedule;
};
