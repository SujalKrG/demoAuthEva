"use strict";
export default (sequelize, DataTypes) => {
  const RolePermission = sequelize.define(
    "RolePermission",
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
      permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "role_permissions",
      timestamps: true,
      createdAt:"created_at",
      updatedAt:"updated_at",
      paranoid: false,
    }
  );

  RolePermission.associate = (models) => {
    RolePermission.belongsTo(models.Role, {
      foreignKey: "role_id",
      as: "role",
    });
    RolePermission.belongsTo(models.Permission, {
      foreignKey: "permission_id",
      as: "permission",
    });
  };

  return RolePermission;
};
