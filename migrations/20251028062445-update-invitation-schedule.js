"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "invitation_schedules",
      "event_id"
    );
    await queryInterface.removeColumn(
      "invitation_schedules",
      "user_theme_id"
    );

    await queryInterface.addColumn(
      "invitation_schedules",
      "event_id",
      {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "events", // 👈 referenced table
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        after: "user_id", // 👈 ensures column order
      }
    );
    await queryInterface.addColumn(
      "invitation_schedules",
      "user_theme_id",
      {
        type: Sequelize.BIGINT,
        allowNull: false,        references: {
          model: "user_themes", // 👈 referenced table
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        after: "event_id", // 👈 ensures column order
      }
    );
    


  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "invitation_schedules",
      "user_theme_id"
    );
    await queryInterface.removeColumn(
      "invitation_schedules",
      "event_id"
    );

    await queryInterface.addColumn(
      "invitation_schedules",
      "event_id",
      {
        type: Sequelize.BIGINT,
        allowNull: false,
      }
    );
    await queryInterface.addColumn(
      "invitation_schedules",
      "user_theme_id",
      {
        type: Sequelize.BIGINT,
        allowNull: false,
      }
    );
    
  },
};
