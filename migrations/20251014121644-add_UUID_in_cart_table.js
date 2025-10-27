"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Add column to message_pricings
    await queryInterface.addColumn("carts", "uuid", {
      type: Sequelize.STRING,
      allowNull: false,
      after: "id",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove column from message_pricings
    await queryInterface.removeColumn("carts", "uuid");
  },
};
