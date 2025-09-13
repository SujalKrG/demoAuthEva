import db from "../models/index.js";
import handleSequelizeError from "../../utils/handelSequelizeError.js";

const generateSlug = (name) => {
  // Slugify the name -> lowercase, spaces & special chars to hyphens
  let base = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  // ✅ Fix common typo: "data" → "date" (optional, only if that's your business rule)
  base = base.replace(/\bdata\b/g, "date");

  // Ensure "-invitation" is added if not already
  const slugBase = base.endsWith("-invitation") ? base : `${base}-invitation`;

  // Generate random 6-digit number
  const uniqueSuffix = Math.floor(100000 + Math.random() * 900000);

  return `${slugBase}-${uniqueSuffix}`;
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
      name,
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



export const updateThemeCategory = async (req, res) => {}

export const deleteThemeCategory = async (req, res) => {}