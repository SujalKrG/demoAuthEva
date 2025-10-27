import db from "../models/index.js";
import { Op } from "sequelize";
import { Sequelize, remoteSequelize } from "../models/index.js";
import countryFactoryModel from "../models/remote/country.js";
import userFactoryModel from "../models/remote/user.js";
import occasionFactoryModel from "../models/remote/occasion.js";

const CountryModel = countryFactoryModel(remoteSequelize, Sequelize.DataTypes);
const UserModel = userFactoryModel(remoteSequelize, Sequelize.DataTypes);
const OccasionModel = occasionFactoryModel(
  remoteSequelize,
  Sequelize.DataTypes
);

export const CartRepository = {
  async findAllWithDetails(filter = {}) {
    return db.Cart.findAll({
      where: filter,
      include: [
        {
          model: db.UserTheme,
          as: "user_theme",
          include: [{ model: db.Theme, as: "theme" }],
        },
        { model: db.Event, as: "event" },
      ],
    });
  },
};

export const RemoteRepository = {
  async getUsersByIds(ids) {
    return UserModel.findAll({
      where: { id: ids },
      attributes: ["id", "name", "email"],
    });
  },

  async getOccasionsByIds(ids) {
    return OccasionModel.findAll({
      where: { id: ids },
      attributes: ["id", "name", "type"],
    });
  },

  async getCountriesByCodes(codes) {
    return CountryModel.findAll({
      where: { code: codes },
      attributes: ["id", "code"],
    });
  },
};

export const MessagePricingRepository = {
  async getPricing(channelIds, countryIds) {
    return db.MessagePricing.findAll({
      where: {
        channel_id: { [Op.in]: channelIds },
        country_id: { [Op.in]: countryIds },
        status: 1,
      },
    });
  },
};
