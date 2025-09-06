"use strict";

export default (sequelize, DataTypes) => {
  const AdminActivityLog = sequelize.define(
    "AdminActivityLog",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      module: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      previous_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      new_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "admin_activity_log",
      timestamps: true, // will auto-create createdAt & updatedAt
    }
  );

  // Associations
  AdminActivityLog.associate = (models) => {
    AdminActivityLog.belongsTo(models.Admin, {
      foreignKey: "created_by",
      as: "admin",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return AdminActivityLog;
};
