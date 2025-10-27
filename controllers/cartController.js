
// import * as cartRepo from "../repositories/cartRepository.js";
// import { CartService } from "../services/cartService.js";
// import { normalizeCountryCode } from "../utils/requiredMethods.js";
// import AppError from "../utils/AppError.js";
// import { logger } from "../utils/logger.js";

// export const getCartSummary = async (req, res, next) => {
//   try {
//     const { userId } = req.query;
//     const filter = userId ? { user_id: userId } : {};

//     const carts = await cartRepo.CartRepository.findAllWithDetails(filter);
//     if (!carts.length) throw new AppError("No carts found", 404);

//     const allCodes = new Set();
//     carts.forEach((c) => {
//       const guestData =
//         typeof c.guest_with_schedules === "string"
//           ? JSON.parse(c.guest_with_schedules)
//           : c.guest_with_schedules || {};

//       const addCode = (raw) => {
//         const norm = normalizeCountryCode(raw);
//         if (norm) allCodes.add(norm);
//       };

//       guestData.groups?.forEach((grp) =>
//         grp.guests?.forEach((g) => addCode(g.countryCode))
//       );
//       guestData.individuals?.guests?.forEach((g) => addCode(g.countryCode));
//     });

//     const countries = await cartRepo.RemoteRepository.getCountriesByCodes([...allCodes]);
//     const countryMap = {};
//     countries.forEach((c) => {
//       const norm = normalizeCountryCode(c.code);
//       if (norm) countryMap[norm] = c.id;
//     });

//     const cartSummaries = [];
//     const userTotal = {
//       totalGuestCount: 0,
//       totalMessages: 0,
//       totalGuestPrice: 0,
//       totalThemePrice: 0,
//       grandTotal: 0,
//     };

//     for (const cart of carts) {
//       const result = await CartService.processCart(cart, countryMap);
//       userTotal.totalGuestCount += result.guest_summary.totalGuestCount;
//       userTotal.totalMessages += result.guest_summary.totalMessages;
//       userTotal.totalGuestPrice += result.guest_summary.totalGuestPrice;
//       userTotal.totalThemePrice += result.theme_summary.themePrice;
//       userTotal.grandTotal += result.total_summary.grandTotal;

//       cartSummaries.push({
//         cart_id: cart.id,
//         user_id: cart.user_id,
//         ...result,
//       });
//     }

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


//-------------------------------------------------

import db from "../models/index.js";
import { Op } from "sequelize";
import AppError from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
import { Sequelize, remoteSequelize } from "../models/index.js";
import countryFactoryModel from "../models/remote/country.js";
import userFactoryModel from "../models/remote/user.js";
import occasionFactoryModel from "../models/remote/occasion.js";
import { loadChannelConfig } from "../config/channelConfig.js";


const CountryModel = countryFactoryModel(remoteSequelize, Sequelize.DataTypes);
const UserModel = userFactoryModel(remoteSequelize, Sequelize.DataTypes);
const OccasionModel = occasionFactoryModel(remoteSequelize, Sequelize.DataTypes);

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

/** Calculate cost for guest based on schedules and pricing */
const calculateGuestCost = async (pricingData, countryId, schedules) => {
  const channelConfig = loadChannelConfig;
  let totalPrice = 0;
  let totalMessages = 0;

  for (const schedule of schedules || []) {
    const scheduleChannel = channelConfig[schedule.channelType];
    if (!scheduleChannel) continue;

    const subChannelIds = scheduleChannel.ids || [scheduleChannel.id];
    const prices = subChannelIds
      .map((id) => {
        const entry = pricingData.find(
          (p) =>
            Number(p.channel_id) === id && Number(p.country_id) === countryId
        );
        return pickPrice(entry);
      })
      .filter((p) => p > 0);

    if (!prices.length) continue;

    if (scheduleChannel.mode === "fallback") {
      totalPrice += Math.max(...prices);
      totalMessages += 1;
    } else if (scheduleChannel.mode === "multi") {
      totalPrice += prices.reduce((a, b) => a + b, 0);
      totalMessages += prices.length;
    } else {
      totalPrice += prices[0];
      totalMessages += 1;
    }
  }

  return { totalPrice, totalMessages };
};

/** ==============================
 *   MAIN CART SUMMARY CONTROLLER
 * ============================== */
export const getCartSummary = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const cartFilter = userId ? { user_id: userId } : {};

    // Fetch carts with event and theme info (main DB only)
    const carts = await db.Cart.findAll({
      where: cartFilter,
      include: [
        {
          model: db.UserTheme,
          as: "user_theme",
          include: [{ model: db.Theme, as: "theme" }],
        },
        {
          model: db.Event,
          as: "event",
        },
      ],
    });
    console.log("-----------------------------");
    
    console.log(carts);

    

    if (!carts.length) throw new AppError("No carts found", 404);

    // --- Step 1: Fetch user info from remote DB ---
    const userIds = carts.map((c) => c.user_id);
    const users = await UserModel.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ["id", "name"],
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    // --- Step 2: Fetch all occasion details for events ---
    const occasionIds = carts
      .map((c) => c.event?.occasion_id)
      .filter((x) => !!x);
    const occasions = await OccasionModel.findAll({
      where: { id: { [Op.in]: occasionIds } },
      attributes: ["id", "name"],
    });
    const occasionMap = Object.fromEntries(occasions.map((o) => [o.id, o]));

    // --- Step 3: Collect all country codes ---
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

    // --- Step 4: Fetch countries (remote DB) ---
    const countries = await CountryModel.findAll({
      where: { code: { [Op.in]: Array.from(allCountryCodes) } },
      attributes: ["id", "code"],
    });
    const countryMap = {};
    countries.forEach((c) => {
      const norm = normalizeCountryCode(c.code);
      if (norm) countryMap[norm] = c.id;
    });

    // --- Step 5: Initialize totals ---
    const userTotal = {
      totalGuestCount: 0,
      totalMessages: 0,
      totalGuestPrice: 0,
      totalThemePrice: 0,
      grandTotal: 0,
    };
    const cartSummaries = [];

    // --- Step 6: Process each cart ---
    for (const cart of carts) {
      const theme = cart.user_theme?.theme;
      const event = cart.event;
      const occasion = event ? occasionMap[event.occasion_id] : null;

      const user = userMap[cart.user_id];
      let themePrice = 0;
      let themeStatus = "unpurchased";
      if (cart.user_theme?.purchased_price > 0) themeStatus = "purchased";
      else if (theme?.offer_price > 0) themePrice = Number(theme.offer_price);
      else if (theme?.base_price > 0) themePrice = Number(theme.base_price);

      const guestData =
        typeof cart.guest_with_schedules === "string"
          ? JSON.parse(cart.guest_with_schedules)
          : cart.guest_with_schedules || {};

      const allChannelIds = new Set();
      const allCountryIds = new Set();

      const collectRefs = (guests, schedules) => {
        guests?.forEach((g) => {
          const norm = normalizeCountryCode(g.countryCode);
          const cId = countryMap[norm];
          if (cId) allCountryIds.add(cId);
        });
        schedules?.forEach((s) => {
          const cfg = loadChannelConfig[s.channelType];
          if (cfg?.ids) cfg.ids.forEach((id) => allChannelIds.add(id));
          else allChannelIds.add(s.channelType);
        });
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
        user: user
          ? { id: user.id, name: user.name, email: user.email }
          : { id: cart.user_id },
        event_summary: event
          ? {
              id: event.id,
              name: event.name,
              date: event.date,
              occasion: occasion
                ? { id: occasion.id, name: occasion.name, type: occasion.type }
                : null,
            }
          : null,
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


//------------------------------------------------------------


// import db from "../models/index.js";
// import { Op } from "sequelize";
// import AppError from "../utils/AppError.js";
// import { logger } from "../utils/logger.js";
// import { Sequelize, remoteSequelize } from "../models/index.js";
// import countryFactoryModel from "../models/remote/country.js";
// import { loadChannelConfig } from "../config/channelConfig.js";

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

// /** Calculate cost for guest based on schedules and pricing */
// const calculateGuestCost = async (pricingData, countryId, schedules) => {
//   const channelConfig = loadChannelConfig; // static mapping
//   let totalPrice = 0;
//   let totalMessages = 0;

//   for (const schedule of schedules || []) {
//     const scheduleChannel = channelConfig[schedule.channelType];
//     if (!scheduleChannel) continue;

//     const subChannelIds = scheduleChannel.ids || [scheduleChannel.id];
//     const prices = subChannelIds
//       .map((id) => {
//         const entry = pricingData.find(
//           (p) =>
//             Number(p.channel_id) === id && Number(p.country_id) === countryId
//         );
//         return pickPrice(entry);
//       })
//       .filter((p) => p > 0);

//     if (!prices.length) continue;

//     if (scheduleChannel.mode === "fallback") {
//       // OR → take max price, 1 message attempt
//       totalPrice += Math.max(...prices);
//       totalMessages += 1;
//     } else if (scheduleChannel.mode === "multi") {
//       // AND → sum all prices, multiple messages
//       totalPrice += prices.reduce((a, b) => a + b, 0);
//       totalMessages += prices.length;
//     } else {
//       // single channel
//       totalPrice += prices[0];
//       totalMessages += 1;
//     }
//   }

//   return { totalPrice, totalMessages };
// };

// /** ==============================
//  *   MAIN CART SUMMARY CONTROLLER
//  * ============================== */
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

//     // --- Step 1: Collect all country codes ---
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

//     // --- Step 2: Fetch countries ---
//     const countries = await CountryModel.findAll({
//       where: { code: { [Op.in]: Array.from(allCountryCodes) } },
//       attributes: ["id", "code"],
//     });
//     const countryMap = {};
//     countries.forEach((c) => {
//       const norm = normalizeCountryCode(c.code);
//       if (norm) countryMap[norm] = c.id;
//     });

//     // --- Step 3: Initialize totals ---
//     const userTotal = {
//       totalGuestCount: 0,
//       totalMessages: 0,
//       totalGuestPrice: 0,
//       totalThemePrice: 0,
//       grandTotal: 0,
//     };
//     const cartSummaries = [];

//     // --- Step 4: Process each cart ---
//     for (const cart of carts) {
//       const theme = cart.user_theme?.theme;
//       let themePrice = 0;
//       let themeStatus = "unpurchased";
//       if (cart.user_theme?.purchased_price > 0) themeStatus = "purchased";
//       else if (theme?.offer_price > 0) themePrice = Number(theme.offer_price);
//       else if (theme?.base_price > 0) themePrice = Number(theme.base_price);

//       const guestData =
//         typeof cart.guest_with_schedules === "string"
//           ? JSON.parse(cart.guest_with_schedules)
//           : cart.guest_with_schedules || {};

//       // Collect all channel and country IDs for pricing query
//       const allChannelIds = new Set();
//       const allCountryIds = new Set();

//       const collectRefs = (guests, schedules) => {
//         guests?.forEach((g) => {
//           const norm = normalizeCountryCode(g.countryCode);
//           const cId = countryMap[norm];
//           if (cId) allCountryIds.add(cId);
//         });
//         schedules?.forEach((s) => {
//           const cfg = loadChannelConfig[s.channelType];
//           if (cfg?.ids) cfg.ids.forEach((id) => allChannelIds.add(id));
//           else allChannelIds.add(s.channelType);
//         });
//       };

//       guestData.groups?.forEach((grp) =>
//         collectRefs(grp.guests, grp.schedules)
//       );
//       guestData.individuals?.guests?.forEach((g) =>
//         collectRefs([g], g.schedules)
//       );

//       // Fetch relevant pricing data
//       const pricingData = await db.MessagePricing.findAll({
//         where: {
//           channel_id: { [Op.in]: Array.from(allChannelIds) },
//           country_id: { [Op.in]: Array.from(allCountryIds) },
//           status: 1,
//         },
//       });

//       // Process each guest
//       const guestBreakdown = [];
//       let totalGuestCount = 0;
//       let totalMessages = 0;
//       let totalGuestPrice = 0;

//       const processGuest = async (guest, schedules, groupName = null) => {
//         const norm = normalizeCountryCode(guest.countryCode);
//         const countryId = countryMap[norm];
//         if (!countryId) return;

//         const { totalPrice: guestPrice, totalMessages: guestMsgCount } =
//           await calculateGuestCost(pricingData, countryId, schedules);

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
//         for (const g of group.guests || []) {
//           await processGuest(g, group.schedules, group.group_name);
//         }
//       }
//       for (const g of guestData.individuals?.guests || []) {
//         await processGuest(g, g.schedules);
//       }

//       const subtotal = themePrice + totalGuestPrice;
//       const grandTotal = subtotal;

//       // Update user totals
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
