"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Add column to message_pricings
    await queryInterface.addColumn("user_themes", "purchased_date", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "purchased_price",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove column from message_pricings
    await queryInterface.removeColumn("user_themes", "purchased_date");
  },
};
