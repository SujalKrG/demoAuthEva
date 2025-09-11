"use strict";

export default (sequelize, DataTypes) => {
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
      tableName: "roles",
      timestamps: true,
      createdAt:"created_at",
      updatedAt:"updated_at",
      paranoid: false,
    }
  );

  Role.associate = (models) => {
    Role.belongsToMany(models.Admin, {
      through: models.AdminRole,
      foreignKey: "role_id",
      otherKey: "admin_id",
      as: "admins",
    });

    Role.belongsToMany(models.Permission, {
      through: models.RolePermission,
      foreignKey: "role_id",
      otherKey: "permission_id",
      as: "permissions",
    });
  };

  return Role;
};
