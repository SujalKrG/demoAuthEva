"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    queryInterface.renameColumn(
      "invitation_schedules",
      "schedule_no",
      "order_no",
    );
  },

  async down(queryInterface, Sequelize) {
    queryInterface.renameColumn(
      "invitation_schedules",
      "order_no",
      "schedule_no",
    );
  },
};
