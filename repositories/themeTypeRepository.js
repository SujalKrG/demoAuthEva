import db from "../models/index.js";
import { Op } from "sequelize";

export const createThemeTypeRepo = async (data) => {
  return await db.ThemeType.create(data);
};

export const findThemeTypeByIdRepo = async (id) => {
  return await db.ThemeType.findByPk(id);
};

export const findAllThemeTypesRepo = async (filters, pagination) => {
  const { category_id, q } = filters;
  const { limit, offset } = pagination;
  const where = {};

  if (category_id) where.category_id = category_id;
  if (q) where.name = { [Op.like]: `%${q}%` };

  return await db.ThemeType.findAndCountAll({
    where,
    include: [
      {
        model: db.ThemeCategory,
        as: "themeCategory",
        attributes: ["id", "name"],
      },
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });
};

export const updateThemeTypeRepo = async (themeType, data) => {
  return await themeType.update(data);
};

export const deleteThemeTypeRepo = async (themeType) => {
  return await themeType.destroy(); // paranoid = true
};
