"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("message_templates", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      occasion_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      channel_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "message_channels",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      language_code: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      header_type: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      header_content: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      body_template: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      footer: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      // ---- Channel-specific Settings ----
      sender_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      media_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      template_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: true,
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("message_templates");
  },
};
