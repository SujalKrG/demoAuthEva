'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
   await queryInterface.createTable("occasion_languages", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      occasion_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      language_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "languages",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Default language for that occasion",
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

  async down (queryInterface, Sequelize) {
    
   await queryInterface.dropTable("occasion_languages");
   
  }
};
