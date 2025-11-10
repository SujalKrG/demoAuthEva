"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Remove existing column
    await queryInterface.removeColumn(
      "invitation_schedules",
      "wallet_transaction_id"
    );

    // Re-add column with foreign key
    await queryInterface.addColumn(
      "invitation_schedules",
      "wallet_transaction_id",
      {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "wallet_transactions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        after: "wallet_used",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove the version with FK constraint
    await queryInterface.removeColumn(
      "invitation_schedules",
      "wallet_transaction_id"
    );

    // Re-add the plain column (original)
    await queryInterface.addColumn(
      "invitation_schedules",
      "wallet_transaction_id",
      {
        type: Sequelize.BIGINT,
        allowNull: true,
      }
    );
  },
};
