"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const removeColumns = [
      "subject",
      "header_type",
      "header_content",
      "body_template",
      "footer",
    ];

    for (const column of removeColumns) {
      try {
        await queryInterface.removeColumn("message_templates", column);
      } catch (error) {
        console.warn(`Skipping removal of column ${column}: ${error.message}`);
      }
    }
    const addColumnSafely = async (name, options) => {
      try {
        await queryInterface.addColumn("message_templates", name, options);
      } catch (err) {
        console.warn(`⚠️ Skipped adding column ${name}:`, err.message);
      }
    };
    await addColumnSafely("template_type", {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: "category",
    });

    await addColumnSafely("components", {
      type: Sequelize.JSON,
      allowNull: true,
      after: "template_type",
    });

    await addColumnSafely("placeholders", {
      type: Sequelize.JSON,
      allowNull: true,
      after: "components",
    });

    await addColumnSafely("media_id", {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: "media_url",
    });

    await addColumnSafely("media_uploaded_at", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "media_id",
    });

   
    

    // 4️⃣ Ensure status default and type consistency
    try {
      await queryInterface.changeColumn("message_templates", "status", {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment:'0=pending , 1=approved, 2=rejected, '
      });
    } catch (err) {
      console.warn("⚠️ Skipped modifying status:", err.message);
    }
  },

  async down(queryInterface, Sequelize) {
    // Rollback: restore dropped columns
    await queryInterface.addColumn("message_templates", "subject", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn("message_templates", "header_type", {
      type: Sequelize.STRING(20),
      allowNull: true,
    });

    await queryInterface.addColumn("message_templates", "header_content", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("message_templates", "body_template", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.addColumn("message_templates", "footer", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Remove newly added fields
    const removeNewColumns = [
      "template_type",
      "components",
      "placeholders",
      "media_id",
      "media_uploaded_at",
    ];
    for (const col of removeNewColumns) {
      try {
        await queryInterface.removeColumn("message_templates", col);
      } catch (err) {
        console.warn(`⚠️ Skipped rollback remove ${col}:`, err.message);
      }
    }

    // Revert template_code and status
    await queryInterface.changeColumn("message_templates", "template_code", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.changeColumn("message_templates", "status", {
      type: Sequelize.TINYINT,
      allowNull: false,
      defaultValue: true,
    });
  },
};
