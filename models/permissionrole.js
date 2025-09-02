"use strict";
export default (sequelize, DataTypes) => {
  const PermissionRole = sequelize.define(
    "PermissionRole",
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
      permissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "permission_role",
      timestamps: true,
      paranoid: false,
    }
  );

  PermissionRole.associate = (models) => {
    PermissionRole.belongsTo(models.Role, {
      foreignKey: "roleId",
      as: "role",
    });
    PermissionRole.belongsTo(models.Permission, {
      foreignKey: "permissionId",
      as: "permission",
    });
  };

  return PermissionRole;
};
