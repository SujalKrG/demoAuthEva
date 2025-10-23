// services/cartService.js
import * as cartRepo from "../repositories/cartRepository.js";
import {
  normalizeCountryCode,
  calculateGuestCost,
  pickPrice,
} from "../utils/pricingUtils.js";

export const getCartSummary = async (userId) => {
  const carts = await cartRepo.getCartsByUserId(userId);
  if (!carts.length) throw new Error("No carts found");

  // Collect all country codes from all carts in one pass
  const allCountryCodes = new Set();
  const collectCountryCodes = (guestData) => {
    const addCode = (raw) => {
      const norm = normalizeCountryCode(raw);
      if (norm) allCountryCodes.add(norm);
    };
    guestData.groups?.forEach((grp) =>
      grp.guests?.forEach((g) => addCode(g.countryCode))
    );
    guestData.individuals?.guests?.forEach((g) => addCode(g.countryCode));
  };
  carts.forEach((cart) => {
    const guestData =
      typeof cart.guest_with_schedules === "string"
        ? JSON.parse(cart.guest_with_schedules)
        : cart.guest_with_schedules || {};
    collectCountryCodes(guestData);
  });

  // Fetch countries once
  const countries = await cartRepo.getCountriesByCodes(
    Array.from(allCountryCodes)
  );
  const countryMap = {};
  countries.forEach((c) => (countryMap[normalizeCountryCode(c.code)] = c.id));

  // Collect all channel & country IDs once
  const allChannelIds = new Set();
  const allCountryIds = new Set();
  carts.forEach((cart) => {
    const guestData =
      typeof cart.guest_with_schedules === "string"
        ? JSON.parse(cart.guest_with_schedules)
        : cart.guest_with_schedules || {};

    const collectRefs = (guests, schedules) => {
      guests?.forEach((g) => {
        const cId = countryMap[normalizeCountryCode(g.countryCode)];
        if (cId) allCountryIds.add(cId);
      });
      schedules?.forEach((s) => allChannelIds.add(Number(s.channelType)));
    };

    guestData.groups?.forEach((grp) => collectRefs(grp.guests, grp.schedules));
    guestData.individuals?.guests?.forEach((g) =>
      collectRefs([g], g.schedules)
    );
  });

  // Fetch all pricing once
  const pricingData = await cartRepo.getMessagePricing(
    Array.from(allChannelIds),
    Array.from(allCountryIds)
  );

  // Build cart summaries
  let userTotal = {
    totalGuestCount: 0,
    totalMessages: 0,
    totalGuestPrice: 0,
    totalThemePrice: 0,
    grandTotal: 0,
  };
  const cartSummaries = carts.map((cart) => {
    const guestData =
      typeof cart.guest_with_schedules === "string"
        ? JSON.parse(cart.guest_with_schedules)
        : cart.guest_with_schedules || {};

    let themePrice = 0;
    let themeStatus = "unpurchased";
    const theme = cart.user_theme?.theme;

    if (cart.user_theme?.purchased_price > 0) themeStatus = "purchased";
    else if (theme?.offer_price > 0) themePrice = Number(theme.offer_price);
    else if (theme?.base_price > 0) themePrice = Number(theme.base_price);

    let totalGuestCount = 0,
      totalMessages = 0,
      totalGuestPrice = 0;
    const guestBreakdown = [];

    const processGuest = (guest, schedules, groupName = null) => {
      const cId = countryMap[normalizeCountryCode(guest.countryCode)];
      if (!cId) return;

      const { totalPrice, totalMessages: guestMsgCount } = calculateGuestCost(
        pricingData,
        cId,
        schedules
      );
      guestBreakdown.push({
        type: groupName ? "group" : "individual",
        groupName,
        guestId: guest.id,
        guestName: guest.name,
        mobile: guest.mobile,
        totalMessages: guestMsgCount,
        totalPrice: Number(totalPrice.toFixed(2)),
      });

      totalGuestCount++;
      totalMessages += guestMsgCount;
      totalGuestPrice += totalPrice;
    };

    guestData.groups?.forEach((g) =>
      g.guests?.forEach((guest) =>
        processGuest(guest, g.schedules, g.group_name)
      )
    );
    guestData.individuals?.guests?.forEach((guest) =>
      processGuest(guest, guest.schedules)
    );

    const subtotal = themePrice + totalGuestPrice;
    const grandTotal = subtotal;

    userTotal.totalGuestCount += totalGuestCount;
    userTotal.totalMessages += totalMessages;
    userTotal.totalGuestPrice += totalGuestPrice;
    userTotal.totalThemePrice += themePrice;
    userTotal.grandTotal += grandTotal;

    return {
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
    };
  });

  return { cartSummaries, userTotal };
};
