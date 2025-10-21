import db from "../models/index.js";

import { messagePricingRepository } from "../repositories/cartRepository.js";

function _isWhatsAppChannel(channelRecord) {
  if (!channelRecord) return false;
  const n = (channelRecord.name || "").toLowerCase();
  return n.includes("wa") || n.includes("whatsapp");
}

function _isRcsChannel(channelRecord) {
  if (!channelRecord) return false;
  const n = (channelRecord.name || "").toLowerCase();
  return n.includes("rcs");
}

export async function resolveChannelPriceByMode(channelId, countryId) {
  // get the channel record
  const channelRec = await messagePricingRepository.getChannel(channelId);
  if (!channelRec) return 0;

  // Normal single channel pricing
  const pricing = await messagePricingRepository.getPricing(
    channelId,
    countryId
  );
  const priceValue = pricing
    ? pricing.final_price ?? pricing.base_price ?? 0
    : 0;

  const name = (channelRec.name || "").toLowerCase();

  // If channel name indicates a combined mode, try to resolve WA and RCS separately
  if (name.includes("+") || name.includes("and")) {
    // attempt to resolve WA and RCS by searching all channels with expected keywords
    // naive approach: query DB for both WA and RCS channel ids by name
    const waChannel = await MessageChannel.findOne({
      where: { name: { [Op.iLike]: "%wa%" } },
    });
    const rcsChannel = await MessageChannel.findOne({
      where: { name: { [Op.iLike]: "%rcs%" } },
    });
    const waPrice = waChannel
      ? (await messagePricingRepository.getPricing(waChannel.id, countryId))
          ?.final_price ?? 0
      : 0;
    const rcsPrice = rcsChannel
      ? (await messagePricingRepository.getPricing(rcsChannel.id, countryId))
          ?.final_price ?? 0
      : 0;
    return (Number(waPrice) || 0) + (Number(rcsPrice) || 0);
  }

  if (name.includes(" or ")) {
    // compute both WA and RCS prices and return max
    const waChannel = await MessageChannel.findOne({
      where: { name: { [Op.iLike]: "%wa%" } },
    });
    const rcsChannel = await MessageChannel.findOne({
      where: { name: { [Op.iLike]: "%rcs%" } },
    });
    const waPrice = waChannel
      ? (await messagePricingRepository.getPricing(waChannel.id, countryId))
          ?.final_price ?? 0
      : 0;
    const rcsPrice = rcsChannel
      ? (await messagePricingRepository.getPricing(rcsChannel.id, countryId))
          ?.final_price ?? 0
      : 0;
    return Math.max(Number(waPrice) || 0, Number(rcsPrice) || 0);
  }

  // Otherwise treat as single channel
  return Number(priceValue) || 0;
}

// import { sequelize, Sequelize, remoteSequelize } from "../models/index.js";

// import countryFactoryModel from "../models/remote/country.js";

// const CountryModel = countryFactoryModel(remoteSequelize, Sequelize.DataTypes);

// export function safeParseGuestJson(value) {
//   if (!value) return { groups: [], individuals: { guests: [] } };
//   if (typeof value === "object") return value;
//   try {
//     return JSON.parse(value);
//   } catch (err) {
//     return { groups: [], individuals: { guests: [] } };
//   }
// }

// export function computeMessageCounts(guestJson) {
//   const breakdown = {}; // { channelType: { countryCode: count } }
//   let totalGuests = 0;
//   let totalSchedules = 0;

//   const groups = guestJson.groups || [];
//   const individuals =
//     (guestJson.individuals && guestJson.individuals.guests) || [];

//   // Groups
//   for (const g of groups) {
//     const guests = Array.isArray(g.guests) ? g.guests : [];
//     const schedules = Array.isArray(g.schedules) ? g.schedules : [];
//     totalGuests += guests.length;
//     totalSchedules += schedules.length * guests.length;

//     for (const schedule of schedules) {
//       const ch = schedule.channelType;
//       for (const guest of guests) {
//         const country = guest.countryCode || guest.country || "+91"; // fallback
//         breakdown[ch] = breakdown[ch] || {};
//         breakdown[ch][country] = (breakdown[ch][country] || 0) + 1;
//       }
//     }
//   }

//   // Individuals
//   for (const guest of individuals) {
//     totalGuests += 1;
//     const schedules = Array.isArray(guest.schedules) ? guest.schedules : [];
//     totalSchedules += schedules.length;

//     for (const schedule of schedules) {
//       const ch = schedule.channelType;
//       const country = guest.countryCode || guest.country || "+91";
//       breakdown[ch] = breakdown[ch] || {};
//       breakdown[ch][country] = (breakdown[ch][country] || 0) + 1;
//     }
//   }

//   return { totalGuests, totalSchedules, breakdown };
// }

// export async function findCountryByDialCode(dialCode) {
//   if (!dialCode) return null;

//   // normalize
//   let code = String(dialCode).trim();
//   if (code.startsWith("+")) code = code.slice(1);

//   // Try likely column names. Adjust if your Country model field differs.
//   const possibleFields = [
//     "calling_code",
//     "dial_code",
//     "phone_code",
//     "callingcode",
//     "country_code",
//     "code",
//     "iso2",
//     "iso3",
//   ];
//   const orConditions = [];

//   for (const f of possibleFields) {
//     const cond = {};
//     cond[f] = code;
//     orConditions.push(cond);
//   }

//   const country = await CountryModel.findOne({
//     where: { [Symbol.for("or")]: orConditions }, // fallback, but Sequelize OR will be implemented below
//   }).catch(() => null);

//   // Note: If your Sequelize version doesn't accept Symbol.for('or') use Op.or at callsite.
//   if (country) return country;

//   // fallback: try Op.or properly (more compatible)
//   try {
//     const { Op } = await import("sequelize");
//     const orClause = { [Op.or]: orConditions };
//     const r = await CountryModel.findOne({ where: orClause });
//     return r;
//   } catch {
//     return null;
//   }
// }

// export async function getMessageUnitPrice(channelId, countryId) {
//   // first try exact
//   let pricing = null;
//   if (countryId) {
//     pricing = await db.MessagePricing.findOne({
//       where: { channel_id: channelId, country_id: countryId },
//     });
//   }

//   // fallback: try channel-only (country null or 0)
//   if (!pricing) {
//     pricing = await db.MessagePricing.findOne({
//       where: { channel_id: channelId },
//       order: [["country_id", "ASC"]], // prefer country-specific rows if any
//     });
//   }

//   if (!pricing) return 0.0;
//   // prefer final_price if present else base_price
//   const unit =
//     pricing.final_price && Number(pricing.final_price) > 0
//       ? Number(pricing.final_price)
//       : Number(pricing.base_price || 0);

//   return unit;
// }
