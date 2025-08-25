"use strict";
module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define(
    "Admin",
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
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      emp_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "admin",
      timestamps: true,
      paranoid: true,
    }
  );

  Admin.associate = (models) => {
    Admin.belongsToMany(models.Role, {
      through: models.RoleAdmin,
      foreignKey: "adminId",
      otherKey: "roleId",
      as: "roles",
    });
  };

  Admin.prototype.getPermissions = async function () {
    const roles = await this.getRoles({
      include: [{ model: sequelize.models.Permission, as: "permissions" }],
    });

    const permissions = [];
    roles.forEach((role) => {
      role.permissions.forEach((perm) => {
        if (!permissions.find((p) => p.id === perm.id)) {
          permissions.push(perm);
        }
      });
    });

    return permissions;
  };

  return Admin;
};
