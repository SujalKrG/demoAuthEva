"use strict";

export default (sequelize, DataTypes) => {
  const MessageChannel = sequelize.define(
    "MessageChannel",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      provider: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "message_channels",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored:true
    }
  );

  return MessageChannel;
};
