"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("user_themes", "file_type", {
      type: Sequelize.STRING(20),
      allowNull: true,
      after: "file_url",
    });
    await queryInterface.addColumn("user_themes", "uuid", {
      type: Sequelize.STRING(20),
      allowNull: true,
      after: "id",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("user_themes", "file_type");
    await queryInterface.removeColumn("user_themes", "uuid");
  },
};
