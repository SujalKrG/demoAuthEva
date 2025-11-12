"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "invitation_schedules",
      "order_no",
      "schedule_no"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "invitation_schedules",
      "schedule_no",
      "order_no"
    );
  },
};
