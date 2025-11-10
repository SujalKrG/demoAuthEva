"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn("invitation_schedules", "order_no", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "id",
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("invitation_schedules", "order_no");
  },
};
