"use strict";

export default (sequelize, DataTypes) => {
  const MessagePricing = sequelize.define(
    "MessagePricing",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      channel_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      country_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      base_price: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      final_price: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "INR",
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
  
      tableName: "message_pricings",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  MessagePricing.associate = (models) => {
    MessagePricing.belongsTo(models.MessageChannel, {
      foreignKey: "channel_id",
      as: "messageChannel",
    });
  };

  return MessagePricing;
};
