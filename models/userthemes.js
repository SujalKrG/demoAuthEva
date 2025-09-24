"use strict";

export default (sequelize, DataTypes) => {
  const UserTheme = sequelize.define(
    "user_themes",
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
      event_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      theme_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      extra_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      purchased_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      file_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "user_themes",
      timestamps: true,
      underscored: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );
  UserTheme.associate = (models) => {
    UserTheme.belongsTo(models.Event, {
      foreignKey: "event_id",
      as: "event",
    });
    UserTheme.belongsTo(models.Theme, {
      foreignKey: "theme_id",
      as: "theme",
    });
  };
  return UserTheme;
};
