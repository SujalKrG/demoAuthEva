import * as cartRepo from "../repositories/cartRepository.js";
import { normalizeCountryCode, calculateGuestCost } from "../utils/pricingUtils.js";

export const getCartSummaryService = async (userId) => {
  const carts = await cartRepo.fetchCarts(userId);
  if (!carts.length) return [];

  // Collect country codes
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

  const countries = await cartRepo.fetchCountriesByCodes(Array.from(allCountryCodes));
  const countryMap = {};
  countries.forEach((c) => {
    const norm = normalizeCountryCode(c.code);
    if (norm) countryMap[norm] = c.id;
  });

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

    guestData.groups?.forEach((grp) => collectRefs(grp.guests, grp.schedules));
    guestData.individuals?.guests?.forEach((g) => collectRefs([g], g.schedules));

    const pricingData = await cartRepo.fetchPricingData(
      Array.from(allChannelIds),
      Array.from(allCountryIds)
    );

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

  return { cartSummaries, userTotal };
};
