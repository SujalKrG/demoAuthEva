import db from "../models/index.js";
import handleSequelizeError from "../utils/handelSequelizeError.js";

export const createTheme = async (req, res) => {
  try {
    const {
      occasion_id,
      category_id,
      name,
      preview_image,
      preview_video,
      component_name,
      config,
      base_price,
      offer_price,
      currency,
      status,
    } = req.body;

    if (!occasion_id || !category_id || !name || !component_name) {
      return res.status(400).json({
        message:
          "occasion_id, category_id, name, and component_name are required.",
      });
    }

    const newTheme = await db.Theme.create({
      occasion_id,
      category_id,
      name,
      preview_image,
      preview_video,
      component_name,
      config,
      base_price: base_price ?? 0.0,
      offer_price,
      currency: currency ?? "INR",
      status: status ?? true,
    });

    return res.status(201).json({
      message: "Theme created successfully",
      data: newTheme,
    });
  } catch (error) {
    console.error("Error creating theme:", error);
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

export const updateTheme = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "invalid or missing theme id" });
    }
    const theme = await db.Theme.findByPk(id);
    if (!theme) {
      return res
        .status(404)
        .json({ success: false, message: "Theme not found" });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "no update data provided" });
    }
    const updatedTheme = await theme.update(req.body);
    return res.status(200).json({
      success: true,
      message: "Theme updated successfully",
      data: updatedTheme,
    });
  } catch (error) {
    console.log("Error updating theme:", error);
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

export const deleteTheme = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing theme ID",
      });
    }
    const theme = await db.Theme.findByPk(id);
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found",
      });
    }
    await theme.destroy();
    return res.status(200).json({
      success: true,
      message: "Theme deleted successfully (soft delete)",
    });
  } catch (error) {
    console.log("Error deleting theme:", error);
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
