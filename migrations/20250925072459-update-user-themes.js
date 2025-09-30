"use strict";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("user_themes", "file_url", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("user_themes", "upload_meta", {
      type: Sequelize.JSON,
      allowNull: true,
      after: "purchased_price",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("user_themes", "upload_meta");
  },
};
