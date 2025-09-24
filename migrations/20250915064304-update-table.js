"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("user_themes", "theme_id", {
      type: Sequelize.BIGINT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("user_themes", "theme_id", {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
  },
};
