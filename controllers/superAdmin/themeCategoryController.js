import db from "../../models/index.js";
import handleSequelizeError from "../../utils/handelSequelizeError.js";
import { cleanString } from "../../utils/occasionResource.js";
import { capitalizeSentence, slug } from "../../utils/requiredMethods.js";

const generateSlug = (name) => {
  // Slugify the name -> lowercase, spaces & special chars to hyphens
  let base = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  // ✅ Fix common typo: "data" → "date" (optional, only if that's your business rule)
  base = base.replace(/\bdata\b/g, "date");

  // Ensure "-invitation" is added if not already
  const slugBase = base.endsWith("-invitation") ? base : `${base}-invitation`;

  
  return `${slugBase}`;
};


export const createThemeCategory = async (req, res) => {
  try {
    const { name,  type, status } = req.body;

    if (!name || !type) {
      return res
        .status(400)
        .json({ message: "Name and type are required." });
    }
    const slug = generateSlug(name);
    const newCategory = await db.ThemeCategory.create({
      name:capitalizeSentence(name),
      slug,
      type,
      status: status ?? true,
    });

    return res.status(201).json({
      message: "Theme category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.error("Error creating theme category:", error);
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
      return res
        .status(400)
        .json({ success: false, message: "invalid or missing theme id" });
    }
    const themeCategory = await db.ThemeCategory.findByPk(id);
    if (!themeCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Theme category not found" });
    }
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "no update data provided" });
    }
    const updatedThemeCategory = await themeCategory.update(req.body);
    return res.status(200).json({
      success: true,
      message: "Theme category updated successfully",
      data: updatedThemeCategory,
    });
  } catch (error) {
   console.log("Error updating theme category:", error);
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
      return res.status(400).json({
        success: false,
        message: "Invalid or missing theme category ID",
      });
    }
    const themeCategory = await db.ThemeCategory.findByPk(id);
    if (!themeCategory) {
      return res.status(404).json({
        success: false,
        message: "Theme category not found",
      });
    }
    await themeCategory.destroy();
    return res.status(200).json({
      success: true,
      message: "Theme category deleted successfully (soft delete)",
    });
  } catch (error) {
    console.log("Error deleting theme category:", error);
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
  
   
}


export const getAllThemeCategories = async (req, res) => {
  try {
    const themeCategories = await db.ThemeCategory.findAll();
    return res.status(200).json({
     
     themeCategories

      
    });
  } catch (error) {
    console.log("Error retrieving theme categories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve theme categories",
      error: error.message,
    });
  }
}
