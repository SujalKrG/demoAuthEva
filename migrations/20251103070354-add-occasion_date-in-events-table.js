"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn("events","occasion_date",{
      type: Sequelize.DATE,
      allowNull: true,
      after: "venue_address",
    })
  },
  

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("events", "occasion_date");
  },
};
