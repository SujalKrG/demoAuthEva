"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn("guest_schedules", "invitation_from", {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: "with_family",
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("guest_schedules", "invitation_from");
  },
};
