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
        comment: "internal Name of the template",
      },
      channel_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "ID of the messaging channel (whatsapp, rcs etc.)",
      },
      language_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: "Language code of the template",
      },
      media_type:{
        type:DataTypes.STRING(20),
        allowNull:true

      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Category of the template (Marketing, Utility, etc.)",
      },
      template_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment:
          "High-level template type (INVITATION, REMINDER, NOTIFICATION)",
      },
      components: {
        type: DataTypes.JSON,
        allowNull: true,
        comment:
          "JSON array defining template components (header, body, footer, buttons)",
      },
      placeholders: {
        type: DataTypes.JSON,
        allowNull: true,
        comment:
          "JSON array of variables for dynamic substitution (e.g., guest_name, event_name)",
      },
      sender_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "WhatsApp Business number ID used to send this template",
      },
      media_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment:
          "Permanent media link (S3/CDN) for uploading to WhatsApp dynamically",
      },
      media_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Cached WhatsApp media ID for reuse; expires in 30 days",
      },
      template_code: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Actual template code approved by WhatsApp",
      },
      media_uploaded_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Timestamp of last media upload to WhatsApp",
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "0=pending , 1=approved, 2=rejected",
      },
    },
    {
      tableName: "message_templates",
      timestamps: true,
      paranoid: true, 
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      underscored: true,
    }
  );

  MessageTemplate.associate = (models) => {
    MessageTemplate.belongsTo(models.MessageChannel, {
      foreignKey: "channel_id",
      as: "channel",
    });

  };

  return MessageTemplate;
};
