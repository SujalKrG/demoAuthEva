"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("themes", "theme_type_id", {
      type: Sequelize.TINYINT,
      allowNull: true,
      references: {
        model: "theme_types", // 👈 referenced table
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      after: "category_id", // 👈 ensures column order
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("themes", "theme_type_id");
  },
};
