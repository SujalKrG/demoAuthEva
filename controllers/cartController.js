import db from "../models/index.js";
import { Op } from "sequelize";
import AppError from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
import { sequelize, Sequelize, remoteSequelize } from "../models/index.js";
import countryFactoryModel from "../models/remote/country.js";

const CountryModel = countryFactoryModel(remoteSequelize, Sequelize.DataTypes);

// Normalize country code "+91"
const normalizeCountryCode = (code) => {
  if (!code) return null;
  const digits = String(code).replace(/\D/g, "").replace(/^0+/, "");
  return digits ? `+${digits}` : null;
};

// Pick usable price
const pickPrice = (entry) => {
  if (!entry) return 0;
  const finalPrice = Number(entry.final_price || 0);
  const basePrice = Number(entry.base_price || 0);
  return finalPrice > 0 ? finalPrice : basePrice;
};

// Resolve message pricing per schedule
const resolveMessagePricing = (pricingData, countryId, scheduleChannelType, mode) => {
  const WA_CHANNELS = [1];
  const RCS_CHANNELS = [2, 3];
  const BOTH_CHANNELS = [4]; // Channel 4 = sends 2 messages

  const waEntry = pricingData.find(
    (p) => WA_CHANNELS.includes(Number(p.channel_id)) && Number(p.country_id) === Number(countryId)
  );
  const rcsEntry = pricingData.find(
    (p) => RCS_CHANNELS.includes(Number(p.channel_id)) && Number(p.country_id) === Number(countryId)
  );
  const bothEntry = pricingData.find(
    (p) => BOTH_CHANNELS.includes(Number(p.channel_id)) && Number(p.country_id) === Number(countryId)
  );
  const specificEntry = pricingData.find(
    (p) => Number(p.channel_id) === Number(scheduleChannelType) && Number(p.country_id) === Number(countryId)
  );

  const waPrice = pickPrice(waEntry);
  const rcsPrice = pickPrice(rcsEntry);
  const bothPrice = pickPrice(bothEntry);
  const specificPrice = pickPrice(specificEntry);

  mode = (mode || "whatsapp").toLowerCase();

  switch (mode) {
    case "both": {
      // Count WA + RCS normally
      let totalMessages = 0;
      let totalPrice = 0;

      if (waPrice > 0) {
        totalMessages += 1;
        totalPrice += waPrice;
      }
      if (rcsPrice > 0) {
        totalMessages += 1;
        totalPrice += rcsPrice;
      }
      if (bothPrice > 0) {
        totalMessages += 2; // channel_id 4 sends 2 messages
        totalPrice += bothPrice * 2; // price doubled
      }
      if (totalMessages === 0 && specificPrice > 0) {
        return { price: specificPrice, messages: 1 };
      }
      return { price: totalPrice, messages: totalMessages };
    }

    case "or":
    case "fallback": {
      const highest = Math.max(waPrice, rcsPrice, bothPrice, specificPrice);
      return { messages: highest > 0 ? 1 : 0, price: highest };
    }

    case "rcs": {
      const price = rcsPrice > 0 ? rcsPrice : specificPrice;
      return { messages: price > 0 ? 1 : 0, price };
    }

    case "whatsapp":
    default: {
      const price = waPrice > 0 ? waPrice : specificPrice;
      return { messages: price > 0 ? 1 : 0, price };
    }
  }
};

// --- Main controller
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

    // Collect all country codes
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
      guestData.groups?.forEach((grp) => grp.guests?.forEach((g) => addCode(g.countryCode)));
      guestData.individuals?.guests?.forEach((ind) => addCode(ind.countryCode));
    });

    // Map remote countries
    const countries = await CountryModel.findAll({
      where: { code: { [Op.in]: Array.from(allCountryCodes) } },
      attributes: ["id", "code"],
    });
    const countryMap = {};
    countries.forEach((c) => {
      const norm = normalizeCountryCode(c.code);
      if (norm) countryMap[norm] = c.id;
    });

    const cartSummaries = [];
    const userTotal = {
      totalGuestCount: 0,
      totalMessages: 0,
      totalGuestPrice: 0,
      totalThemePrice: 0,
      grandTotal: 0,
    };

    // Process each cart
    for (const cart of carts) {
      const { guest_with_schedules, channel_mode } = cart;
      const userTheme = cart.user_theme;
      const theme = userTheme?.theme;

      // Theme price
      let themePrice = 0;
      let themeStatus = "unpurchased";
      if (userTheme?.purchased_price > 0) {
        themePrice = 0;
        themeStatus = "purchased";
      } else if (theme?.offer_price > 0) {
        themePrice = Number(theme.offer_price);
      } else if (theme?.base_price > 0) {
        themePrice = Number(theme.base_price);
      }

      const guestData =
        typeof guest_with_schedules === "string"
          ? JSON.parse(guest_with_schedules)
          : guest_with_schedules || {};

      // Collect channel + country IDs
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
      guestData.groups?.forEach((grp) => collectRefs(grp.guests, grp.schedules));
      guestData.individuals?.guests?.forEach((ind) => collectRefs([ind], ind.schedules));

      const pricingData = await db.MessagePricing.findAll({
        where: {
          channel_id: { [Op.in]: Array.from(allChannelIds) },
          country_id: { [Op.in]: Array.from(allCountryIds) },
        },
      });

      // Guest calculation
      const guestBreakdown = [];
      let totalGuestCount = 0;
      let totalMessages = 0;
      let totalGuestPrice = 0;
      const processed = new Set();

      const processGuest = (guest, schedules, groupName = null) => {
        if (processed.has(guest.id)) return;

        const norm = normalizeCountryCode(guest.countryCode);
        const cId = countryMap[norm];
        let guestPrice = 0;
        let guestMsgCount = 0;

        schedules?.forEach((s) => {
          const { price, messages } = resolveMessagePricing(pricingData, cId, s.channelType, channel_mode);
          guestPrice += price;
          guestMsgCount += messages;
        });

        totalGuestPrice += guestPrice;
        totalMessages += guestMsgCount;
        totalGuestCount++;
        processed.add(guest.id);

        guestBreakdown.push({
          type: groupName ? "group" : "individual",
          groupName: groupName || null,
          guestId: guest.id,
          guestName: guest.name,
          mobile: guest.mobile,
          totalPrice: guestPrice,
          totalMessages: guestMsgCount,
        });
      };

      for (const group of guestData.groups || []) {
        const guests = group.guests || [];
        const schedules = group.schedules || [];
        guests.forEach((g) => processGuest(g, schedules, group.group_name));
      }

      for (const guest of guestData.individuals?.guests || []) {
        processGuest(guest, guest.schedules);
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
          themePrice,
        },
        guest_summary: {
          totalGuestCount,
          totalMessages,
          totalGuestPrice,
          breakdown: guestBreakdown,
        },
        total_summary: {
          subtotal,
          grandTotal,
        },
      });
    }

    return res.status(200).json({
      success: true,
      carts: cartSummaries,
      user_total_summary: userId ? userTotal : undefined,
    });
  } catch (err) {
    logger.error("Cart summary calculation error:", err);
    next(err);
  }
};
