"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("guest_schedules", "code", {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: "user_id",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("guest_schedules", "code");
  },
};
