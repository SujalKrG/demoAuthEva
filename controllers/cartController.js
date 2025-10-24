import db from "../models/index.js";
import { Op } from "sequelize";
import AppError from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
import { Sequelize, remoteSequelize } from "../models/index.js";
import countryFactoryModel from "../models/remote/country.js";
import userFactoryModel from "../models/remote/user.js";
import { loadChannelConfig } from "../config/channelConfig.js";

const CountryModel = countryFactoryModel(remoteSequelize, Sequelize.DataTypes);
const RemoteUserModel = userFactoryModel(remoteSequelize, Sequelize.DataTypes);

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
  const channelConfig = loadChannelConfig; // static mapping
  let totalPrice = 0;
  let totalMessages = 0
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

    // --- Fetch carts with all relations ---
    const carts = await db.Cart.findAll({
      where: cartFilter,
      include: [
        {
          model: db.UserTheme,
          as: "user_theme",
          include: [
            { model: db.Theme, as: "theme", attributes: ["id","name"]},
            { model: db.Event, as: "event", attributes: ["id", "title"]},
          ],
        },
      ],
    });

    if (!carts.length) throw new AppError("No carts found", 404);

    // --- Step 1: Collect all country codes ---
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

    // --- Step 2: Fetch countries ---
    const countries = await CountryModel.findAll({
      where: { code: { [Op.in]: Array.from(allCountryCodes) } },
      attributes: ["id", "code"],
    });
    const countryMap = {};
    countries.forEach((c) => {
      const norm = normalizeCountryCode(c.code);
      if (norm) countryMap[norm] = c.id;
    });

    // --- Step 3: Fetch user data (from remote DB) ---
    const userIds = carts.map((c) => c.user_id);
    const users = await RemoteUserModel.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: [
        "id",
        "name",
        "email",
      
      ],
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    // --- Step 4: Process each cart ---
    const cartSummaries = [];

    for (const cart of carts) {
      const user = userMap[cart.user_id];
      const theme = cart.user_theme?.theme;
      const event = cart.user_theme?.event;

      let themePrice = 0;
      let themeStatus = "unpurchased";
      if (cart.user_theme?.purchased_price > 0) themeStatus = "purchased";
      else if (theme?.offer_price > 0) themePrice = Number(theme.offer_price);
      else if (theme?.base_price > 0) themePrice = Number(theme.base_price);

      const guestData =
        typeof cart.guest_with_schedules === "string"
          ? JSON.parse(cart.guest_with_schedules)
          : cart.guest_with_schedules || {};

      // Collect all channel and country IDs for pricing query
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

      // Fetch relevant pricing data
      const pricingData = await db.MessagePricing.findAll({
        where: {
          channel_id: { [Op.in]: Array.from(allChannelIds) },
          country_id: { [Op.in]: Array.from(allCountryIds) },
          status: 1,
        },
      });

      // Process each guest
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

      // --- Build the enriched cart response ---
      cartSummaries.push({
        cart_id: cart.id,
        user: user ? user.toJSON() : null,
        event: event ? event.toJSON() : null,
        user_theme: {
          id: cart.user_theme?.id,
          purchased_price: cart.user_theme?.purchased_price,
          purchased_date: cart.user_theme?.purchased_date,
          file_url: cart.user_theme?.file_url,
        },
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
    });
  } catch (err) {
    logger.error("Cart summary calculation error:", err);
    next(err);
  }
};
