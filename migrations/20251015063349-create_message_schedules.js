"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("message_schedules", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      guest_schedule_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "guest_schedules",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      parent_channel_type: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      channel_type: {
        type: Sequelize.TINYINT,
        allowNull: false,
        comment: "1=WhatsApp, 2=SMS",
      },
      message_template_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "message_templates",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      language_code: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: "en",
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      priority: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      time_zone: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "Asia/Kolkata",
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment:
          "1=pending, 2=scheduled, 3=sending, 4=sent, 5=failed, 6=delivered, 7=read, 8=cancelled",
      },
      response: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      retry_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      last_retry_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("message_schedules");
  },
};
