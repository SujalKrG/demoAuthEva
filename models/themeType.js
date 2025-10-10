"use strict";

export default (sequelize, DataTypes) => {
  const ThemeType = sequelize.define(
    "ThemeType",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      category_id: {
        type: DataTypes.TINYINT,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "theme_types",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  ThemeType.associate = (models) => {
    ThemeType.belongsTo(models.ThemeCategory, {
      foreignKey: "category_id",
      as: "themeCategory",
    });
  };

  return ThemeType;
};
