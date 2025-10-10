import {
  createThemeTypeRepo,
  findThemeTypeByIdRepo,
  findAllThemeTypesRepo,
  updateThemeTypeRepo,
  deleteThemeTypeRepo,
} from "../repositories/themeTypeRepository.js";
// import { handleSequelizeError } from "../utils/handelSequelizeError.js";

export const createThemeTypeService = async (data) => {
  try {
    const { name, category_id, status } = data;

    if (!name || !category_id) {
      return {
        success: false,
        status: 400,
        message: "Name and category_id are required.",
      };
    }

    const newThemeType = await createThemeTypeRepo({
      name,
      category_id,
      status: status ?? true,
    });

    return {
      success: true,
      status: 201,
      message: "Theme type created successfully.",
      data: newThemeType,
    };
  } catch (error) {
    // const handled = handleSequelizeError(error);
    return { success: false, status: 500, message: "Database error." };
  }
};

export const getAllThemeTypesService = async (query) => {
  try {
    const { category_id, q, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const { rows, count } = await findAllThemeTypesRepo(
      { category_id, q },
      { limit: parseInt(limit), offset: parseInt(offset) }
    );

    return {
      success: true,
      status: 200,
      message: "Theme types fetched successfully.",
      total: count,
      data: rows,
    };
  } catch (error) {
    // const handled = handleSequelizeError(error);
    return { success: false, status: 500, message: "Database error." };
  }
};

export const updateThemeTypeService = async (id, data) => {
  try {
    const themeType = await findThemeTypeByIdRepo(id);
    if (!themeType) {
      return { success: false, status: 404, message: "Theme type not found." };
    }

    const allowedFields = ["name", "category_id", "status"];
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key))
    );

    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        status: 400,
        message: "No valid fields to update.",
      };
    }

    const updatedThemeType = await updateThemeTypeRepo(themeType, updateData);

    return {
      success: true,
      status: 200,
      message: "Theme type updated successfully.",
      data: updatedThemeType,
    };
  } catch (error) {
    // const handled = handleSequelizeError(error);
    return { success: false, status: 500, message: "Database error." };
  }
};

export const deleteThemeTypeService = async (id) => {
  try {
    const themeType = await findThemeTypeByIdRepo(id);
    if (!themeType) {
      return { success: false, status: 404, message: "Theme type not found." };
    }

    await deleteThemeTypeRepo(themeType);
    return {
      success: true,
      status: 200,
      message: "Theme type deleted successfully.",
    };
  } catch (error) {
    // const handled = handleSequelizeError(error);
    return { success: false, message: "Database error." };
  }
};
