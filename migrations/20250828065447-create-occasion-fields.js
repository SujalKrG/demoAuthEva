"use strict";

/** @type {import('sequelize-cli').Migration} */
export default{
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("occasion_fields", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      occasion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      field_key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      option: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      order_no: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
     
});

await queryInterface.addConstraint("occasion_fields", {
  fields: ["occasion_id", "order_no"],
  type: "unique",
  name: "unique_occasion_order",
});

    await queryInterface.addIndex("occasion_fields", [
      "occasion_id",
      "order_no",
    ]);
    await queryInterface.addIndex("occasion_fields", ["field_key"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("occasion_fields");
  },
};
