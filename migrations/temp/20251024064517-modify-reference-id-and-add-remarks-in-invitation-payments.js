"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // 🧩 Step 1: remove existing foreign key constraint (if it exists)
    // The constraint name depends on what Sequelize auto-generated before.
    // If you named it explicitly in earlier migration, use that.
    // Otherwise, try inspecting DB: SHOW CREATE TABLE invitation_payments;
    // Example common auto-name: invitation_payments_reference_id_foreign
    try {
      await queryInterface.removeConstraint(
        "invitation_payments",
        "invitation_payments_ibfk_1"
      );
    } catch (error) {
      console.log(
        "⚠️  Skipping removeConstraint — may not exist:",
        error.message
      );
    }

    // 🧩 Step 2: change the column type
    await queryInterface.changeColumn("invitation_payments", "reference_id", {
      type: Sequelize.BIGINT,
      allowNull: true,
    });

    // add remarks column (nullable)
    // check if column already exists might be useful, but Sequelize lacks an atomic cross-dialect check here;
    // we assume it's not present (if it is, migration will fail — in that case use addColumn inside try/catch)
    await queryInterface.addColumn("invitation_payments", "remarks", {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      comment: "Optional remarks for payment",
    });
  },

  async down(queryInterface, Sequelize) {
    // remove remarks column
    try {
      await queryInterface.removeColumn("invitation_payments", "remarks");
    } catch (err) {
      console.log("removeColumn remarks skipped:", err.message);
    }

    // revert reference_id back to FK to themes.id
    await queryInterface.changeColumn("invitation_payments", "reference_id", {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: "themes",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // re-add FK constraint explicitly (name it so it can be removed cleanly later)
    try {
      await queryInterface.addConstraint("invitation_payments", {
        fields: ["reference_id"],
        type: "foreign key",
        name: "invitation_payments_ibfk_1", // same name used above
        references: {
          table: "themes",
          field: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    } catch (err) {
      console.log("addConstraint skipped (maybe exists):", err.message);
    }
  },
};
