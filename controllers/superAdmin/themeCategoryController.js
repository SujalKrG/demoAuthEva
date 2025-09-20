import db from "../../models/index.js";
import handleSequelizeError from "../../utils/handelSequelizeError.js";
import { capitalizeSentence } from "../../utils/requiredMethods.js";
import { logger } from "../../utils/logger.js";
import logActivity from "../../utils/logActivity.js";
import { Sequelize } from "sequelize";

export const createThemeCategory = async (req, res) => {
  try {
    const { name, type, status } = req.body;

    if (!name || !type) {
      logger.error("[createThemeCategory] Name and type are required");
      return res.status(400).json({ message: "Name and type are required." });
    }
    const slug = name;
    const newCategory = await db.ThemeCategory.create({
      name: capitalizeSentence(name),
      slug,
      type,
      status: status ?? true,
    });
    logActivity({
      created_by: req.admin.id,
      action: `new Theme category created: ${newCategory.name}`,
      module: "Theme Category",
      details: {
        newCategory,
      },
    });
    logger.info("[createThemeCategory] Theme category created successfully");

    return res.status(201).json({
      message: "Theme category created successfully",
      data: newCategory,
    });
  } catch (error) {
    logger.error(
      "[createThemeCategory] Error creating theme category:]",
      error
    );
    const handled = handleSequelizeError(error, res);
    if (handled) return handled;

    // Handle generic Node.js / unexpected errors
    return res.status(500).json({
      message: "Unexpected server error",
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : error.message,
    });
  }
};

export const updateThemeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      logger.error("[updateThemeCategory] invalid or missing theme id");
      return res
        .status(400)
        .json({ success: false, message: "invalid or missing theme id" });
    }
    const themeCategory = await db.ThemeCategory.findByPk(id);
    if (!themeCategory) {
      logger.error("[updateThemeCategory] Theme category not found");
      return res
        .status(404)
        .json({ success: false, message: "Theme category not found" });
    }
    if (!req.body || Object.keys(req.body).length === 0) {
      logger.error("[updateThemeCategory] no update data provided");
      return res
        .status(400)
        .json({ success: false, message: "no update data provided" });
    }
    const updatedThemeCategory = await themeCategory.update(req.body);
    logActivity({
      created_by: req.admin.id,
      action: `Theme category updated`,
      module: "Theme Category",
      details: {
        updatedThemeCategory,
      },
    });
    logger.info("[updateThemeCategory] Theme category updated successfully");
    return res.status(200).json({
      success: true,
      message: "Theme category updated successfully",
      data: updatedThemeCategory,
    });
  } catch (error) {
    logger.error(
      "[updateThemeCategory] Error updating theme category:]",
      error
    );
    const handled = handleSequelizeError(error, res);
    if (handled) return handled;

    // Handle generic Node.js / unexpected errors
    return res.status(500).json({
      message: "Unexpected server error",
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : error.message,
    });
  }
};

export const deleteThemeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      logger.error(
        "[deleteThemeCategory] Invalid or missing theme category ID"
      );
      return res.status(400).json({
        success: false,
        message: "Invalid or missing theme category ID",
      });
    }
    const themeCategory = await db.ThemeCategory.findByPk(id);
    if (!themeCategory) {
      logger.error("[deleteThemeCategory] Theme category not found");
      return res.status(404).json({
        success: false,
        message: "Theme category not found",
      });
    }
    await themeCategory.destroy();
    logActivity({
      created_by: req.admin.id,
      action: `Theme category deleted`,
      module: "Theme Category",
      details: {
        deletedThemeCategory: themeCategory,
      },
    });
    logger.info("[deleteThemeCategory] Theme category deleted successfully");
    return res.status(200).json({
      success: true,
      message: "Theme category deleted successfully (soft delete)",
    });
  } catch (error) {
    logger.error(
      "[deleteThemeCategory] Error deleting theme category:]",
      error
    );
    const handled = handleSequelizeError(error, res);
    if (handled) return handled;

    // Handle generic Node.js / unexpected errors
    return res.status(500).json({
      message: "Unexpected server error",
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : error.message,
    });
  }
};

export const getAllThemeCategories = async (req, res) => {
  try {
    const themeCategories = await db.ThemeCategory.findAll({
      attributes: [
        "id",
        "name",

        "type",
        "status",

        [Sequelize.fn("COUNT", Sequelize.col("themes.id")), "theme_count"],
      ],
      include: [
        {
          model: db.Theme,
          as: "themes",
          attributes: [],
        },
      ],
      group: ["ThemeCategory.id"],
      order: [["created_at", "DESC"]],
    });
    logger.info(
      "[getAllThemeCategories] Theme categories fetched successfully"
    );
    return res.status(200).json({
      count: themeCategories.length,

      themeCategories,
    });
  } catch (error) {
    logger.error(
      "[getAllThemeCategories] Error fetching theme categories:]",
      error
    );
    const handled = handleSequelizeError(error, res);
    if (handled) return handled;

    return res.status(500).json({
      message: "Unexpected server error",
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : error.message,
    });
  }
};
