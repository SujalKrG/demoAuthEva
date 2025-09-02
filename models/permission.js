"use strict";

export default (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    "Permission",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "permission",
      timestamps: true,
      paranoid: false,
    }
  );

  Permission.associate = (models) => {
    Permission.belongsToMany(models.Role, {
      through: models.PermissionRole,
      foreignKey: "permissionId",
      otherKey: "roleId",
      as: "roles",
    });
  };

  return Permission;
};
