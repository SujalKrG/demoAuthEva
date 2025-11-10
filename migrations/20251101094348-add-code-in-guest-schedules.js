'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
   queryInterface.addColumn("guest_schedules", "code",{
     type: Sequelize.STRING(50),
     allowNull: true,
     after: "user_id",
   })
  },
  

  async down (queryInterface, Sequelize) {
    queryInterface.removeColumn("guest_schedules", "code")
  }
};
