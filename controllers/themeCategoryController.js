import { Sequelize } from "sequelize";
import { logger } from "../utils/logger.js";
import logActivity from "../utils/logActivity.js";
import {
  createThemeCategoryService,
  updateThemeCategoryService,
  deleteThemeCategoryService,
  getAllThemeCategoriesService,
} from "../services/themeCategoryService.js";

export const createThemeCategory = async (req, res, next) => {
  try {
    const newCategory = await createThemeCategoryService(req.body);
    logActivity(
      3,
      null,
      `new Theme category created - ${newCategory.name}`,
      `Theme Category`,
      {
        id: 3,
        name: newCategory.name,
        slug: newCategory.slug,
        type: newCategory.type,
        status: newCategory.status,
      },
      newCategory.created_at,
      newCategory.updated_at
    );
    return res.status(201).json({
      success: true,
      message: "Theme category created successfully",
      data: newCategory,
    });
  } catch (error) {
    logger.error(`[ThemeCategory][create] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const updateThemeCategory = async (req, res, next) => {
  try {
    const updatedCategory = await updateThemeCategoryService(
      req.params.id,
      req.body
    );
    logActivity(
      3,
      null,
      `Theme category updated - ${updatedCategory.name}`,
      `Theme Category`,
      {
        id: 3,
        name: updatedCategory.name,
        slug: updatedCategory.slug,
        type: updatedCategory.type,
        status: updatedCategory.status,
      },
      updatedCategory.created_at,
      updatedCategory.updated_at
    );
    return res.status(200).json({
      success: true,
      message: "Theme category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    logger.error(`[ThemeCategory][update] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const deleteThemeCategory = async (req, res, next) => {
  try {
    const deletedCategory = await deleteThemeCategoryService(req.params.id);
    logActivity(
      3,
      null,
      `Theme category deleted - ${deletedCategory.name}`,
      `Theme Category`,
      {
        id: 3,
        name: deletedCategory.name,
        slug: deletedCategory.slug,
        type: deletedCategory.type,
        status: deletedCategory.status,
      },
      deletedCategory.created_at,
      deletedCategory.updated_at
    );
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Theme category not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Theme category deleted successfully",
      data: deletedCategory,
    });
  } catch (error) {
    logger.error(`[ThemeCategory][delete] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const getAllThemeCategories = async (req, res, next) => {
  try {
    const themeCategories = await getAllThemeCategoriesService(Sequelize);
    return res.status(200).json({
      success: true,
      message: "Theme categories fetched successfully",
      data: themeCategories,
    });
  } catch (error) {
    logger.error(`[ThemeCategory][getAll] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};
