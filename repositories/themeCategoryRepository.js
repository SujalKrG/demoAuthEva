import db from "../models/index.js";

export const createThemeCategoryRepo = async (data) => {
  return await db.ThemeCategory.create(data);
};

export const findThemeCategoryByIdRepo = async (id) => {
  return await db.ThemeCategory.findByPk(id);
};

export const updateThemeCategoryRepo = async (themeCategory, data) => {
  return await themeCategory.update(data);
};

export const deleteThemeCategoryRepo = async (themeCategory) => {
  return await themeCategory.destroy();
};

export const getAllThemeCategoriesRepo = async (Sequelize) => {
  return await db.ThemeCategory.findAll({
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
};
