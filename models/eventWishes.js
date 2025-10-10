"use strict";

export default (sequelize, DataTypes) => {
  const EventWishes = sequelize.define(
    "EventWishes",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      event_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      guest_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "event_wishes",
      timestamps: true,
      underscored: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  EventWishes.associate = (models) => {
    if (models.events) {
      EventWishes.belongsTo(models.events, {
        foreignKey: "event_id",
        as: "event",
      });
    }

    if (models.guest_directories) {
      EventWishes.belongsTo(models.guest_directories, {
        foreignKey: "guest_id",
        as: "guest",
      });
    }

    if (models.event_conversations) {
      EventWishes.hasMany(models.event_conversations, {
        foreignKey: "event_wish_id",
        as: "conversations",
      });
    }
  };

  return EventWishes;
};
