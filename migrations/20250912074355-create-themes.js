"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
   await queryInterface.createTable("themes", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      occasion_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        
      },
      category_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "theme_categories", // references theme_categories.id
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      preview_image: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      preview_video: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      component_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      config: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      base_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      offer_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: "INR",
      },
      status: {
        type: Sequelize.BOOLEAN,
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
   await queryInterface.dropTable("themes");
  },
};
