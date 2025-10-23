"use strict";
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const OccasionLanguage = sequelize.define(
    "OccasionLanguage",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      occasion_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      language_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Default language for that occasion",
      },
    },
    {
      tableName: "occasion_languages",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  OccasionLanguage.associate = (models) => {
    OccasionLanguage.belongsTo(models.Language, {
      foreignKey: "language_id",
      as: "language",
    });
  };

  return OccasionLanguage;
};
