"use strict";

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "Role",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "role",
      timestamps: true,
      paranoid: false,
    }
  );

  Role.associate = (models) => {
    Role.belongsToMany(models.Admin, {
      through: models.RoleAdmin,
      foreignKey: "roleId",
      otherKey: "adminId",
      as: "admins",
    });

    Role.belongsToMany(models.Permission, {
      through: models.PermissionRole,
      foreignKey: "roleId",
      otherKey: "permissionId",
      as: "permissions",
    });
  };

  return Role;
};
