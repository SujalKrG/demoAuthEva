"use strict";
export default (sequelize, DataTypes) => {
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
        validate: {
          is: {
            args: /^[0-9]{10}$/,
            msg: "Invalid phone number format.",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      emp_id: {
        type: DataTypes.STRING,
        allowNull: true,
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
      remember_token: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reset_password_OTP: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'reset_password_otp',
        
      },
      reset_password_OTP_expire: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reset_password_otp_expire'
      },
    },
    {
      tableName: "admins",
      timestamps: true,
       underscored: true,
       paranoid: true,
      createdAt:"created_at",
      updatedAt:"updated_at",
      deletedAt: 'deleted_at',
    }
  );

  Admin.associate = (models) => {
    Admin.belongsToMany(models.Role, {
      through: models.AdminRole,
      foreignKey: "admin_id",
      otherKey: "role_id",
      as: "roles",
    });
    Admin.hasMany(models.AdminActivityLog, {
      foreignKey: "created_by",
      as: "admin_activity_logs",
    });
  };
  

  // Instance method
  Admin.prototype.getPermissions = async function () {
    const roles = await this.getRoles({
      include: [{ model: sequelize.models.Permission, as: "permissions" }],
    });

    const permissionMap = new Map();
    roles.forEach((role) =>
      role.permissions.forEach((perm) => permissionMap.set(perm.id, perm))
    );

    return Array.from(permissionMap.values());
  };

  return Admin;
};
