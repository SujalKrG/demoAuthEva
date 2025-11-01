"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn("user_themes", "file_type", {
      type: Sequelize.STRING(20),
      allowNull: true,
      after: "file_url",
    });
    queryInterface.addColumn("user_themes", "uuid", {
      type: Sequelize.STRING(20),
      allowNull: true,
      after: "id",
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("user_themes", "file_type");
    queryInterface.removeColumn("user_themes", "uuid");
    
  },
};
