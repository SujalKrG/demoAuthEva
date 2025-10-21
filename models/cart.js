"use strict";

export default (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    "Cart",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid:{
        type: DataTypes.STRING,
        allowNull: false,
      },
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
      guest_with_schedules: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      buy_now: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "carts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Cart.associate = (models) => {
    Cart.belongsTo(models.Event, {
      foreignKey: "event_id",
      as: "event",
    });
    Cart.belongsTo(models.UserTheme, {
      foreignKey: "user_theme_id",
      as: "user_theme",
    });
  };

  return Cart;
};
