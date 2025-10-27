import { loadChannelConfig } from "../config/channelConfig.js";
import { pickPrice, normalizeCountryCode } from "../utils/requiredMethods.js";
import * as cartRepo from "../repositories/cartRepository.js";

export const PricingService = {
  async calculateGuestCost(pricingData, countryId, schedules) {
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
  },
};



export const CartService = {
  async processCart(cart, countryMap) {
    const theme = cart.user_theme?.theme;
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

    const pricingData = await cartRepo.MessagePricingRepository.getPricing(
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

      const { totalPrice, totalMessages: guestMsgCount } =
        await PricingService.calculateGuestCost(pricingData, countryId, schedules);

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

    return {
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
      total_summary: { subtotal, grandTotal },
    };
  },
};