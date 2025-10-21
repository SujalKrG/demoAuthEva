"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("message_pricings", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
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
      country_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      base_price: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      final_price: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: "INR",
      },
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("message_pricings");
  },
};
