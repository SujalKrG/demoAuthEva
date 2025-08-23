"use strict";
module.exports = (sequelize, DataTypes) => {
  const RoleAdmin = sequelize.define(
    "RoleAdmin",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      adminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "role_admins",
      timestamps: true,
      paranoid: false,
    }
  );

  RoleAdmin.associate = (models) => {
    RoleAdmin.belongsTo(models.Role, {
      foreignKey: "roleId",
      as: "role",
    });
    RoleAdmin.belongsTo(models.Admin, {
      foreignKey: "adminId",
      as: "admin",
    });
  };

  return RoleAdmin;
};
