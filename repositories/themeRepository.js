import db from "../models/index.js";
import { sequelize, Sequelize, remoteSequelize } from "../models/index.js";
import CountryModelFactory from "../models/remote/country.js";
import { Op } from "sequelize";
const CountryModel = CountryModelFactory(remoteSequelize, Sequelize.DataTypes);
import OccasionModelFactory from "../models/remote/occasion.js";
const OccasionModel = OccasionModelFactory(
  remoteSequelize,
  Sequelize.DataTypes
);
export const countryCodeRepo = async () => {
  return await CountryModel.findAll({
    where: { status: 1 },
  });
};

export const findThemeTypeRepo = async (id) => {
  return await db.ThemeType.findByPk(id,{
    include:[
      {
        model:db.ThemeCategory,
        as:"themeCategory",
        attributes:["id","name"]
      }
    ]
  });
};


export const findThemeWithCategory = async (id) => {
  return await db.Theme.findByPk(id, {
    include: [
      {
        model: db.ThemeCategory,
        as: "themeCategory",
        attributes: ["id", "name", "type"],
      },
    ],
  });
};

export const updateThemeStatusRepo = async (theme, status) => {
  return await theme.update({ status });
};

export const softDeleteThemeRepo = async (theme) => {
  return await theme.destroy(); // paranoid=true
};

export const getThemesRepo = async (whereConditions, limit, offset) => {
  return await db.Theme.findAndCountAll({
    where: whereConditions,
    attributes: [
      "id",
      "name",
      "slug",
      "occasion_id",
      "category_id",
      "theme_type_id",
      "status",
      "preview_image",
      "preview_video",
      "base_price",
      "offer_price",
      "currency",
      "component_name",
    ],
    include: [
      {
        model: db.ThemeCategory,
        as: "themeCategory",
        attributes: ["id", "name"],
      },
      {
        model:db.ThemeType,
        as:"themeType",
        attributes:["id","name"]
      }
    ],
    limit,
    offset,
    order: [["created_at", "desc"]],
  });
};

export const createThemeRepo = async (data) => {
  return await db.Theme.create(data);
};

export const findOccasionById = async (id) => {
  return await OccasionModel.findByPk(id);
};
export const findThemeCategoryById = async (id) => {
  return await db.ThemeCategory.findByPk(id);
};

export const getThemeRepo = async (id) => {
  return await db.Theme.findByPk(id);
};
export const updateThemeRepo = async (theme, updateData) => {
  return await theme.update(updateData);
};
