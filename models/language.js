'use strict';
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Language = sequelize.define(
    'Language',
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'languages',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  Language.associate = (models) => {
    Language.hasMany(models.OccasionLanguage, {
      foreignKey: 'language_id',
      as: 'occasion_languages',
    });
  };

  return Language;
};
