"use strict";

export default (sequelize, DataTypes) => {
  const MessageSchedule = sequelize.define(
    "MessageSchedule",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      guest_schedule_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      parent_channel_type: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      channel_type: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "1=WhatsApp, 2=SMS",
      },
      message_template_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      language_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "en",
      },
      scheduled_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      priority: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      time_zone: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Asia/Kolkata",
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment:
          "1=pending, 2=scheduled, 3=sending, 4=sent, 5=failed, 6=delivered, 7=read, 8=cancelled",
      },
      response: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      retry_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      last_retry_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "MessageSchedule",
      tableName: "message_schedules",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  MessageSchedule.associate = (models) => {
    // Each message belongs to a guest
    MessageSchedule.belongsTo(models.GuestSchedule, {
      foreignKey: "guest_schedule_id",
      as: "guestSchedule",
    });

    // Each message can be linked to a message template
    MessageSchedule.belongsTo(models.MessageTemplate, {
      foreignKey: "message_template_id",
      as: "messageTemplate",
    });
  };

  return MessageSchedule;
};
