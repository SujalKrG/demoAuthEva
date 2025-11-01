"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("message_templates", "media_type", {
      type: Sequelize.STRING(20),
      allowNull: true,
      after: "language_code",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("message_templates", "media_type");
  },
};
