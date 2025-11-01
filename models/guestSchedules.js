"use strict";

export default (sequelize, DataTypes) => {
  const GuestSchedule = sequelize.define(
    "GuestSchedule",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      invitation_schedule_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country_code: {
        type: DataTypes.STRING(5),
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      with_family: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      invitation_from: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      group_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "GuestSchedule",
      tableName: "guest_schedules",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  GuestSchedule.associate = (models) => {
    // Each guest belongs to an invitation schedule
    GuestSchedule.belongsTo(models.InvitationSchedule, {
      foreignKey: "invitation_schedule_id",
      as: "invitationSchedule",
    });
  };

  return GuestSchedule;
};
