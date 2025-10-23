// repositories/cartRepository.js
import db from "../models/index.js";
import { Op } from "sequelize";
import { Sequelize, remoteSequelize } from "../models/index.js";
import countryFactoryModel from "../models/remote/country.js";

const CountryModel = countryFactoryModel(remoteSequelize, Sequelize.DataTypes);

export const getCartsByUserId = async (userId) => {
  return db.Cart.findAll({
    where: { ...(userId && { user_id: userId }) },
    include: [
      {
        model: db.UserTheme,
        as: "user_theme",
        include: [{ model: db.Theme, as: "theme" }],
      },
    ],
  });
};

export const getCountriesByCodes = async (codes) => {
  return CountryModel.findAll({
    where: { code: { [Op.in]: codes } },
    attributes: ["id", "code"],
  });
};

export const getMessagePricing = async (channelIds, countryIds) => {
  return db.MessagePricing.findAll({
    where: {
      channel_id: { [Op.in]: channelIds },
      country_id: { [Op.in]: countryIds },
      status: 1,
    },
  });
};
