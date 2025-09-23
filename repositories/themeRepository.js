import db from "../models/index.js";

export const createTheme = (data) => db.Theme.create(data);

export const updateThemeById = (id, updates) =>
  db.Theme.update(updates, { where: { id }, individualHooks: true });

export const deleteThemeById = (id) =>
  db.Theme.destroy({ where: { id } });

export const findThemeById = (id) => db.Theme.findByPk(id);

export const findThemes = ({ where, limit, offset }) =>
  db.Theme.findAndCountAll({
    where,
    limit,
    offset,
    order: [["created_at", "desc"]],
    include: [
      { model: db.ThemeCategory, as: "themeCategory", attributes: ["id", "name"] },
    ],
  });
