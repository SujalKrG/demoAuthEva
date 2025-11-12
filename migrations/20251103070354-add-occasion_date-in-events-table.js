"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
   await queryInterface.addColumn("events","occasion_date",{
      type: Sequelize.DATE,
      allowNull: true,
      after: "venue_address",
    })
  },
  

  async down(queryInterface, Sequelize) {
  await  queryInterface.removeColumn("events", "occasion_date");
  },
};
