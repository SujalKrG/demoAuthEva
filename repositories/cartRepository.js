import db from "../models/index.js";
import { sequelize, Sequelize, remoteSequelize } from "../models/index.js";
import userModelFactory from "../models/remote/user.js";
const UserModel = userModelFactory(remoteSequelize, Sequelize.DataTypes);
import countryModelFactory from "../models/remote/country.js";
const CountryModel = countryModelFactory(remoteSequelize, Sequelize.DataTypes);

export const cartRepository = {
  async getCartById(id) {
    return await db.Cart.findByPk(id, {
      include: [
        {
          model: UserTheme,
          as: "user_theme",
          include: [{ model: Theme, as: "theme" }],
        },
        { model: Event, as: "event" },
      ],
    });
  },
};

const pricingCache = new Map(); // key => `${channelId}_${countryId}` -> pricing

export const messagePricingRepository = {
  async getPricing(channelId, countryId) {
    const key = `${channelId}_${countryId}`;
    if (pricingCache.has(key)) return pricingCache.get(key);

    // First try to find an exact final_price record
    const pricing = await db.MessagePricing.findOne({
      where: { channel_id: channelId, country_id: countryId },
      include: [{ model: MessageChannel, as: "messageChannel" }],
    });

    // cache nulls too so we don't repeatedly query
    pricingCache.set(key, pricing || null);
    return pricing || null;
  },

  // helper to fetch channel record
  async getChannel(channelId) {
    return await db.MessageChannel.findByPk(channelId);
  },

  // optional: resolve country by countryCode string (eg "+91" or "India (+91)")
  async resolveCountryId(countryCodeString) {
    if (!countryCodeString) return null;
    // try to extract +NNN
    const plusMatch = countryCodeString.match(/\+?\d+/g);
    let possible = null;
    if (plusMatch) possible = plusMatch[0];

    // try exact lookup by code or name
    const where = {};
    if (possible) where.phone_code = possible; // assumes Country.phone_code
    // fallback: match by name if string contains letters
    // Try by phone_code first
    let country = null;
    if (possible)
      country = await CountryModel.findOne({ where: { code: possible } });
    if (!country) {
      // try phone_code with +
      country = await CountryModel.findOne({
        where: { code: `+${possible}` },
      });
    }
    if (!country) {
      // try fuzzy name (simple contains)
      const nameOnly = countryCodeString.replace(/[+()\d]/g, "").trim();
      if (nameOnly)
        country = await CountryModel.findOne({ where: { name: nameOnly } });
    }
    return country ? country.id : null;
  },
};
