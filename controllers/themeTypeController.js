import {
  createThemeTypeService,
  getAllThemeTypesService,
  updateThemeTypeService,
  deleteThemeTypeService,
} from "../services/themeTypeService.js";
import db from "../models/index.js";


export const createThemeType = async (req, res) => {
  const result = await createThemeTypeService(req.body);
  return res.status(result.status).json(result);
};

export const getAllThemeTypes = async (req, res) => {
  const result = await getAllThemeTypesService(req.query);
  return res.status(result.status).json(result);
};

export const updateThemeType = async (req, res) => {
  const { id } = req.params;
  const result = await updateThemeTypeService(id, req.body);
  return res.status(result.status).json(result);
};

export const deleteThemeType = async (req, res) => {
  const { id } = req.params;
  const result = await deleteThemeTypeService(id);
  return res.status(result.status).json(result);
};

export const getThemeTypeByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required.",
      });
    }

    const themeTypes = await db.ThemeType.findAll({
      where: { category_id: category_id },
      include: [
        {
          model: db.ThemeCategory,
          as: "themeCategory",
          attributes: ["id", "name"],
        },
      ],
      attributes: ["id", "name", "status"],
      order: [["created_at", "DESC"]],
    });

    // const result = await getAllThemeTypesService({ category_id });
   return res.status(200).json({
      success: true,
      data: themeTypes,
    });
  } catch (error) {
    console.error("Error fetching theme types by category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch theme types by category.",
      // error: error.message,
    });
  }
};
