"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "invitation_schedules",
      "wallet_transaction_id",
      {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "wallet_transactions", // 👈 referenced table
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        after: "wallet_used", // 👈 ensures column order
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "invitation_schedules",
      "wallet_transaction_id"
    );
  },
};
