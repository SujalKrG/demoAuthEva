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

// import db from "../models/index.js";

// // ===========================
// // Create a new ThemeType
// // ===========================
// export const createThemeType = async (req, res) => {
//   try {
//     const { name, category_id, status } = req.body;

//     if (!name || !category_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Name and category_id are required.",
//       });
//     }

//     const newThemeType = await db.ThemeType.create({
//       name,
//       category_id,
//       status: status ?? true, // default to true if not provided
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Theme type created successfully.",
//       data: newThemeType,
//     });
//   } catch (error) {
//     console.error("Error creating theme type:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create theme type.",
//       error: error.message,
//     });
//   }
// };

// // ===========================
// // Get all ThemeTypes
// // ===========================
// export const getAllThemeTypes = async (req, res) => {
//   try {
//     const { category_id, q, page = 1, limit = 10 } = req.query;
//     const where = {};

//     if (category_id) where.category_id = category_id;
//     if (q) where.name = { [db.Sequelize.Op.like]: `%${q}%` };

//     const offset = (page - 1) * limit;

//     const { rows, count } = await db.ThemeType.findAndCountAll({
//       where,
//       include: [
//         {
//           model: db.ThemeCategory,
//           as: "themeCategory",
//           attributes: ["id", "name"],
//         },
//       ],
//       order: [["created_at", "DESC"]],
//       limit: parseInt(limit),
//       offset: parseInt(offset),
//     });

//     return res.status(200).json({
//       success: true,
//       total: count,
//       data: rows,
//     });
//   } catch (error) {
//     console.error("Error fetching theme types:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch theme types.",
//       error: error.message,
//     });
//   }
// };

// // ===========================
// // Soft Delete a ThemeType
// // ===========================
// export const deleteThemeType = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const themeType = await db.ThemeType.findByPk(id);
//     if (!themeType) {
//       return res.status(404).json({
//         success: false,
//         message: "Theme type not found.",
//       });
//     }

//     await themeType.destroy(); // soft delete (because paranoid: true)

//     return res.status(200).json({
//       success: true,
//       message: "Theme type deleted successfully.",
//     });
//   } catch (error) {
//     console.error("Error deleting theme type:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete theme type.",
//       error: error.message,
//     });
//   }
// };
