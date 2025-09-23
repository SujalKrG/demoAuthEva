"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("admins", "remember_token", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("admins", "remember_token");
  },
};
