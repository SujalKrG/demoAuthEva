"use strict";

export default (sequelize, DataTypes) => {
  const Wallet = sequelize.define(
    "Wallet",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
      },
      wallet_no: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "INR",
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1, // 1=Active, 2=Suspended
      },
    },
    {
      sequelize,
      modelName: "Wallet",
      tableName: "wallets",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Wallet;
};
