"use strict";
export default (sequelize, DataTypes) => {
  const AdminRole = sequelize.define(
    "AdminRole",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      admin_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "admin_roles",
      timestamps: true,
      createdAt:"created_at",
      updatedAt:"updated_at",
      paranoid: false,
    }
  );

  AdminRole.associate = (models) => {
    AdminRole.belongsTo(models.Role, {
      foreignKey: "role_id",
      as: "role",
    });
    AdminRole.belongsTo(models.Admin, {
      foreignKey: "admin_id",
      as: "admin",
    });
  };

  return AdminRole;
};
