import db from "../models/index.js";
import { Op } from "sequelize";
import AppError from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
import { Sequelize, remoteSequelize } from "../models/index.js";
import countryFactoryModel from "../models/remote/country.js";
import { loadChannelConfig } from "../config/channelConfig.js";

const CountryModel = countryFactoryModel(remoteSequelize, Sequelize.DataTypes);

/** Normalize country codes like "+91" */
const normalizeCountryCode = (code) => {
  if (!code) return null;
  const digits = String(code).replace(/\D/g, "").replace(/^0+/, "");
  return digits ? `+${digits}` : null;
};

/** Pick price: final_price if >0 else base_price */
const pickPrice = (entry) => {
  if (!entry) return 0;
  const finalPrice = Number(entry.final_price || 0);
  const basePrice = Number(entry.base_price || 0);
  return finalPrice > 0 ? finalPrice : basePrice;
};

/** Calculate guest message cost dynamically */
const calculateGuestCost = async (pricingData, countryId, schedules) => {
  const channelConfig = await loadChannelConfig();
  const { byId, byCode } = channelConfig;

  let totalPrice = 0;
  let totalMessages = 0;

  const getPrice = (channelId) => {
    const entry = pricingData.find(
      (p) =>
        Number(p.channel_id) === channelId && Number(p.country_id) === countryId
    );
    return pickPrice(entry);
  };

  for (const schedule of schedules || []) {
    const channelId = Number(schedule.channelType);
    const channel = byId[channelId];
    if (!channel) continue;

    const code = channel.code.toUpperCase();

    // Handle single channels (like WA, RCS, SMS, etc.)
    if (!code.includes("|") && !code.includes("&")) {
      totalPrice += getPrice(channelId);
      totalMessages += 1;
      continue;
    }

    // Split composite codes like "WA|RCS" or "WA&RCS"
    const parts = code.split(/[|&]/).map((c) => c.trim().toUpperCase());
    const channelParts = parts.map((part) => byCode[part]).filter(Boolean);

    if (!channelParts.length) continue;

    const prices = channelParts.map((ch) => getPrice(ch.id));

    if (code.includes("|")) {
      // OR-type logic → pick cheapest available
      totalPrice += Math.min(...prices);
      totalMessages += 1;
    } else if (code.includes("&")) {
      // AND-type logic → add all
      totalPrice += prices.reduce((a, b) => a + b, 0);
      totalMessages += prices.length;
    }
  }

  return { totalPrice, totalMessages };
};

/** Main Cart Summary Controller */
export const getCartSummary = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const cartFilter = userId ? { user_id: userId } : {};

    const carts = await db.Cart.findAll({
      where: cartFilter,
      include: [
        {
          model: db.UserTheme,
          as: "user_theme",
          include: [{ model: db.Theme, as: "theme" }],
        },
      ],
    });

    if (!carts.length) throw new AppError("No carts found", 404);

    /** Collect all country codes */
    const allCountryCodes = new Set();
    carts.forEach((cart) => {
      const guestData =
        typeof cart.guest_with_schedules === "string"
          ? JSON.parse(cart.guest_with_schedules)
          : cart.guest_with_schedules || {};

      const addCode = (raw) => {
        const norm = normalizeCountryCode(raw);
        if (norm) allCountryCodes.add(norm);
      };

      guestData.groups?.forEach((grp) =>
        grp.guests?.forEach((g) => addCode(g.countryCode))
      );
      guestData.individuals?.guests?.forEach((g) => addCode(g.countryCode));
    });

    /** Fetch countries */
    const countries = await CountryModel.findAll({
      where: { code: { [Op.in]: Array.from(allCountryCodes) } },
      attributes: ["id", "code"],
    });

    const countryMap = {};
    countries.forEach((c) => {
      const norm = normalizeCountryCode(c.code);
      if (norm) countryMap[norm] = c.id;
    });

    /** User totals */
    const userTotal = {
      totalGuestCount: 0,
      totalMessages: 0,
      totalGuestPrice: 0,
      totalThemePrice: 0,
      grandTotal: 0,
    };

    const cartSummaries = [];

    for (const cart of carts) {
      const { guest_with_schedules } = cart;
      const theme = cart.user_theme?.theme;
      let themePrice = 0;
      let themeStatus = "unpurchased";

      if (cart.user_theme?.purchased_price > 0) themeStatus = "purchased";
      else if (theme?.offer_price > 0) themePrice = Number(theme.offer_price);
      else if (theme?.base_price > 0) themePrice = Number(theme.base_price);

      const guestData =
        typeof guest_with_schedules === "string"
          ? JSON.parse(guest_with_schedules)
          : guest_with_schedules || {};

      const allChannelIds = new Set();
      const allCountryIds = new Set();

      const collectRefs = (guests, schedules) => {
        guests?.forEach((g) => {
          const norm = normalizeCountryCode(g.countryCode);
          const cId = countryMap[norm];
          if (cId) allCountryIds.add(cId);
        });
        schedules?.forEach((s) => allChannelIds.add(Number(s.channelType)));
      };

      guestData.groups?.forEach((grp) =>
        collectRefs(grp.guests, grp.schedules)
      );
      guestData.individuals?.guests?.forEach((g) =>
        collectRefs([g], g.schedules)
      );

      const pricingData = await db.MessagePricing.findAll({
        where: {
          channel_id: { [Op.in]: Array.from(allChannelIds) },
          country_id: { [Op.in]: Array.from(allCountryIds) },
          status: 1,
        },
      });

      const guestBreakdown = [];
      let totalGuestCount = 0;
      let totalMessages = 0;
      let totalGuestPrice = 0;

      const processGuest = async (guest, schedules, groupName = null) => {
        const norm = normalizeCountryCode(guest.countryCode);
        const countryId = countryMap[norm];
        if (!countryId) return;

        const { totalPrice: guestPrice, totalMessages: guestMsgCount } =
          await calculateGuestCost(pricingData, countryId, schedules);

        guestBreakdown.push({
          type: groupName ? "group" : "individual",
          groupName,
          guestId: guest.id,
          guestName: guest.name,
          mobile: guest.mobile,
          totalMessages: guestMsgCount,
          totalPrice: Number(guestPrice.toFixed(2)),
        });

        totalGuestCount++;
        totalMessages += guestMsgCount;
        totalGuestPrice += guestPrice;
      };

      for (const group of guestData.groups || []) {
        for (const g of group.guests || []) {
          await processGuest(g, group.schedules, group.group_name);
        }
      }

      for (const g of guestData.individuals?.guests || []) {
        await processGuest(g, g.schedules);
      }

      const subtotal = themePrice + totalGuestPrice;
      const grandTotal = subtotal;

      userTotal.totalGuestCount += totalGuestCount;
      userTotal.totalMessages += totalMessages;
      userTotal.totalGuestPrice += totalGuestPrice;
      userTotal.totalThemePrice += themePrice;
      userTotal.grandTotal += grandTotal;

      cartSummaries.push({
        cart_id: cart.id,
        user_id: cart.user_id,
        theme_summary: {
          id: theme?.id,
          name: theme?.name,
          themeStatus,
          themePrice: Number(themePrice.toFixed(2)),
        },
        guest_summary: {
          totalGuestCount,
          totalMessages,
          totalGuestPrice: Number(totalGuestPrice.toFixed(2)),
          breakdown: guestBreakdown,
        },
        total_summary: {
          subtotal: Number(subtotal.toFixed(2)),
          grandTotal: Number(grandTotal.toFixed(2)),
        },
      });
    }

    res.status(200).json({
      success: true,
      carts: cartSummaries,
      user_total_summary: userId ? userTotal : undefined,
    });
  } catch (err) {
    logger.error("Cart summary calculation error:", err);
    next(err);
  }
};

// // controllers/cartController.js
// import * as cartService from "../services/cartService.js";
// import { logger } from "../utils/logger.js";

// export const getCartSummary = async (req, res, next) => {
//   try {
//     const { userId } = req.query;
//     const { cartSummaries, userTotal } = await cartService.getCartSummary(userId);

//     res.status(200).json({
//       success: true,
//       carts: cartSummaries,
//       user_total_summary: userId ? userTotal : undefined,
//     });
//   } catch (err) {
//     logger.error("Cart summary error:", err);
//     next(err);
//   }
// };

// import db from "../models/index.js";
// import { Op } from "sequelize";
// import AppError from "../utils/AppError.js";
// import { logger } from "../utils/logger.js";
// import { Sequelize, remoteSequelize } from "../models/index.js";
// import countryFactoryModel from "../models/remote/country.js";
// // import { getChannelConfig } from "../config/channelConfig.js";

// const CountryModel = countryFactoryModel(remoteSequelize, Sequelize.DataTypes);

// /** Normalize country codes like "+91" */
// const normalizeCountryCode = (code) => {
//   if (!code) return null;
//   const digits = String(code).replace(/\D/g, "").replace(/^0+/, "");
//   return digits ? `+${digits}` : null;
// };

// /** Pick price: final_price if >0 else base_price */
// const pickPrice = (entry) => {
//   if (!entry) return 0;
//   const finalPrice = Number(entry.final_price || 0);
//   const basePrice = Number(entry.base_price || 0);
//   return finalPrice > 0 ? finalPrice : basePrice;
// };

// /** Calculate cost per guest per schedule */
// const calculateGuestCost = (pricingData, countryId, schedules) => {
//   let totalPrice = 0;
//   let totalMessages = 0;

//   // fetch WA & RCS prices once per country
//   const waPrice =
//     pickPrice(
//       pricingData.find(
//         (p) => Number(p.channel_id) === 1 && Number(p.country_id) === countryId
//       )
//     ) || 0;
//   const rcsPrice =
//     pickPrice(
//       pricingData.find(
//         (p) => Number(p.channel_id) === 2 && Number(p.country_id) === countryId
//       )
//     ) || 0;

//   schedules?.forEach((s) => {
//     const type = Number(s.channelType);

//     switch (type) {
//       case 1: // WA
//         totalPrice += waPrice;
//         totalMessages += 1;
//         break;

//       case 2: // RCS
//         totalPrice += rcsPrice;
//         totalMessages += 1;
//         break;

//       case 3: // OR
//         totalPrice += Math.max(waPrice, rcsPrice); // pick the higher
//         totalMessages += 1;
//         break;

//       case 4: // BOTH
//         totalPrice += waPrice + rcsPrice;
//         totalMessages += 2;
//         break;

//       default:
//         break;
//     }
//   });

//   return { totalPrice, totalMessages };
// };

// /** Main Cart Summary Controller */
// export const getCartSummary = async (req, res, next) => {
//   try {
//     const { userId } = req.query;
//     const cartFilter = userId ? { user_id: userId } : {};

//     const carts = await db.Cart.findAll({
//       where: cartFilter,
//       include: [
//         {
//           model: db.UserTheme,
//           as: "user_theme",
//           include: [{ model: db.Theme, as: "theme" }],
//         },
//       ],
//     });

//     if (!carts.length) throw new AppError("No carts found", 404);

//     /** Collect all country codes from guests */
//     const allCountryCodes = new Set();
//     carts.forEach((cart) => {
//       const guestData =
//         typeof cart.guest_with_schedules === "string"
//           ? JSON.parse(cart.guest_with_schedules)
//           : cart.guest_with_schedules || {};
//       const addCode = (raw) => {
//         const norm = normalizeCountryCode(raw);
//         if (norm) allCountryCodes.add(norm);
//       };
//       guestData.groups?.forEach((grp) =>
//         grp.guests?.forEach((g) => addCode(g.countryCode))
//       );
//       guestData.individuals?.guests?.forEach((g) => addCode(g.countryCode));
//     });

//     /** Fetch countries */
//     const countries = await CountryModel.findAll({
//       where: { code: { [Op.in]: Array.from(allCountryCodes) } },
//       attributes: ["id", "code"],
//     });

//     const countryMap = {};
//     countries.forEach((c) => {
//       const norm = normalizeCountryCode(c.code);
//       if (norm) countryMap[norm] = c.id;
//     });

//     /** Initialize user totals */
//     const userTotal = {
//       totalGuestCount: 0,
//       totalMessages: 0,
//       totalGuestPrice: 0,
//       totalThemePrice: 0,
//       grandTotal: 0,
//     };

//     const cartSummaries = [];

//     /** Process each cart */
//     for (const cart of carts) {
//       const { guest_with_schedules, channel_mode } = cart;
//       const theme = cart.user_theme?.theme;
//       let themePrice = 0;
//       let themeStatus = "unpurchased";

//       if (cart.user_theme?.purchased_price > 0) themeStatus = "purchased";
//       else if (theme?.offer_price > 0) themePrice = Number(theme.offer_price);
//       else if (theme?.base_price > 0) themePrice = Number(theme.base_price);

//       const guestData =
//         typeof guest_with_schedules === "string"
//           ? JSON.parse(guest_with_schedules)
//           : guest_with_schedules || {};

//       /** Gather all channel and country IDs for pricing fetch */
//       const allChannelIds = new Set();
//       const allCountryIds = new Set();

//       const collectRefs = (guests, schedules) => {
//         guests?.forEach((g) => {
//           const norm = normalizeCountryCode(g.countryCode);
//           const cId = countryMap[norm];
//           if (cId) allCountryIds.add(cId);
//         });
//         schedules?.forEach((s) => allChannelIds.add(Number(s.channelType)));
//       };

//       guestData.groups?.forEach((grp) =>
//         collectRefs(grp.guests, grp.schedules)
//       );
//       guestData.individuals?.guests?.forEach((g) =>
//         collectRefs([g], g.schedules)
//       );

//       /** Fetch message pricing */
//       const pricingData = await db.MessagePricing.findAll({
//         where: {
//           channel_id: { [Op.in]: Array.from(allChannelIds) },
//           country_id: { [Op.in]: Array.from(allCountryIds) },
//           status: 1,
//         },
//       });

//       /** Calculate guest breakdown */
//       const guestBreakdown = [];
//       let totalGuestCount = 0;
//       let totalMessages = 0;
//       let totalGuestPrice = 0;

//       const processGuest = (guest, schedules, groupName = null) => {
//         const norm = normalizeCountryCode(guest.countryCode);
//         const countryId = countryMap[norm];
//         if (!countryId) return;

//         const { totalPrice: guestPrice, totalMessages: guestMsgCount } =
//           calculateGuestCost(pricingData, countryId, schedules, channel_mode);

//         guestBreakdown.push({
//           type: groupName ? "group" : "individual",
//           groupName,
//           guestId: guest.id,
//           guestName: guest.name,
//           mobile: guest.mobile,
//           totalMessages: guestMsgCount,
//           totalPrice: Number(guestPrice.toFixed(2)),
//         });

//         totalGuestCount++;
//         totalMessages += guestMsgCount;
//         totalGuestPrice += guestPrice;
//       };

//       for (const group of guestData.groups || []) {
//         group.guests?.forEach((g) =>
//           processGuest(g, group.schedules, group.group_name)
//         );
//       }

//       for (const g of guestData.individuals?.guests || []) {
//         processGuest(g, g.schedules);
//       }

//       const subtotal = themePrice + totalGuestPrice;
//       const grandTotal = subtotal;

//       userTotal.totalGuestCount += totalGuestCount;
//       userTotal.totalMessages += totalMessages;
//       userTotal.totalGuestPrice += totalGuestPrice;
//       userTotal.totalThemePrice += themePrice;
//       userTotal.grandTotal += grandTotal;

//       cartSummaries.push({
//         cart_id: cart.id,
//         user_id: cart.user_id,
//         theme_summary: {
//           id: theme?.id,
//           name: theme?.name,
//           themeStatus,
//           themePrice: Number(themePrice.toFixed(2)),
//         },
//         guest_summary: {
//           totalGuestCount,
//           totalMessages,
//           totalGuestPrice: Number(totalGuestPrice.toFixed(2)),
//           breakdown: guestBreakdown,
//         },
//         total_summary: {
//           subtotal: Number(subtotal.toFixed(2)),
//           grandTotal: Number(grandTotal.toFixed(2)),
//         },
//       });
//     }

//     res.status(200).json({
//       success: true,
//       carts: cartSummaries,
//       user_total_summary: userId ? userTotal : undefined,
//     });
//   } catch (err) {
//     logger.error("Cart summary calculation error:", err);
//     next(err);
//   }
// };
