"use strict";

export default (sequelize, DataTypes) => {
  const InvitationPayment = sequelize.define(
    "InvitationPayment",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },

      payment_type: {
        type: DataTypes.ENUM("invitation", "theme", "wallet_topup"),
        allowNull: false,
      },

      reference_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },

      payment_mode: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "Mode of payment — card, net banking, UPI, etc.",
      },

      gateway_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: "0.00",
      },

      gateway_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      gateway_payment_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      gateway_response: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("pending", "completed", "failed", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },

      refund_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: null,
      },

      refund_status: {
        type: DataTypes.ENUM("pending", "completed", "failed", "cancelled"),
        allowNull: true,
        defaultValue: null,
      },

      refund_response: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      refunded_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "InvitationPayment",
      tableName: "invitation_payments",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: false, // No deleted_at in this table
    }
  );
  InvitationPayment.associate = (models) => {
    InvitationPayment.belongsTo(models.Theme, {
      foreignKey: "reference_id",
      as: "theme",
    });
  };

  return InvitationPayment;
};
