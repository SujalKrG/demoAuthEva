"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("invitation_schedules", "order_no", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "id",
    });
  },

  async down(queryInterface, Sequelize) {
   await queryInterface.removeColumn("invitation_schedules", "order_no");
  },
};
