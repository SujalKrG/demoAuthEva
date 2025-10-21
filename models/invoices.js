"use strict";

export default (sequelize, DataTypes) => {
  const Invoice = sequelize.define(
    "Invoice",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      invitation_payment_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },

      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },

      invoice_number: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },

      invoice_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      gst_percentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 18,
      },

      amount_without_gst: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      gst_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      currency_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "INR",
      },

      invoice_status: {
        type: DataTypes.ENUM("draft", "issued", "cancelled"),
        allowNull: false,
        defaultValue: "issued",
      },

      notes: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      billing_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      billing_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      gstin: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },

      tax_breakdown: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Invoice",
      tableName: "invoices",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Invoice.associate = (models) => {
    // Each invoice belongs to an invitation payment
    Invoice.belongsTo(models.InvitationPayment, {
      foreignKey: "invitation_payment_id",
      as: "invitationPayment",
    });
  };

  return Invoice;
};
