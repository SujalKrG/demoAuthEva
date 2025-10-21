"use strict";

export default (sequelize, DataTypes) => {
  const WalletTransaction = sequelize.define(
    "WalletTransaction",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("credit", "debit"),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "INR",
      },
      source: {
        type: DataTypes.ENUM(
          "topup",
          "invitation",
          "refund",
          "admin_adjustment"
        ),
        allowNull: false,
      },
      reference_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      balance_after: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      remarks: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0, // 0=pending, 1=hold, 2=success, 3=failed, 4=reverted
      },
    },
    {
      sequelize,
      modelName: "WalletTransaction",
      tableName: "wallet_transactions",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  WalletTransaction.associate = (models) => {
    // A wallet transaction can be associated with an invitation schedule
    WalletTransaction.belongsTo(models.InvitationSchedule, {
      foreignKey: "reference_id",
      as: "invitationSchedule",
    });
  };

  return WalletTransaction;
};
