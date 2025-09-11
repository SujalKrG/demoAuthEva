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
      user_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      module: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      details: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      
    },
    {
      tableName: "admin_activity_logs",
      timestamps: true, // will auto-create createdAt & updatedAt
      createdAt:"created_at",
      updatedAt:"updated_at",
      
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
