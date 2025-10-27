"use strict";

export default (sequelize, DataTypes) => {
  const MessageTemplate = sequelize.define(
    "MessageTemplate",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      occasion_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      channel_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      language_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      header_type: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      header_content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      body_template: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      footer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sender_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      media_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      template_code: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: true,
      },
     
    },
    {
      sequelize,
      modelName: "MessageTemplate",
      tableName: "message_templates",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true, // Enables soft delete using deleted_at
      deletedAt: "deleted_at",
    }
  );

  MessageTemplate.associate = (models) => {
    MessageTemplate.belongsTo(models.MessageChannel, {
      foreignKey: "channel_id",
      as: "messageChannel",
    });
  };

  return MessageTemplate;
};
