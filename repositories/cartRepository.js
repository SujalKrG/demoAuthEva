import db from "../models/index.js";
import { Op } from "sequelize";
import { Sequelize, remoteSequelize } from "../models/index.js";
import countryFactoryModel from "../models/remote/country.js";
const CountryModel = countryFactoryModel(remoteSequelize, Sequelize.DataTypes);

export const fetchCarts = async (userId) => {
  const cartFilter = userId ? { user_id: userId } : {};
  return db.Cart.findAll({
    where: cartFilter,
    include: [
      {
        model: db.UserTheme,
        as: "user_theme",
        include: [{ model: db.Theme, as: "theme" }],
      },
    ],
  });
};

export const fetchPricingData = async (channelIds, countryIds) => {
  return db.MessagePricing.findAll({
    where: {
      channel_id: { [Op.in]: channelIds },
      country_id: { [Op.in]: countryIds },
      status: 1,
    },
  });
};

export const fetchCountriesByCodes = async (codes) => {
  return CountryModel.findAll({
    where: { code: { [Op.in]: codes } },
    attributes: ["id", "code"],
  });
};
