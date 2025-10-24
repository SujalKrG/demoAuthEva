import { loadChannelConfig } from "../config/channelConfig.js";

/** Normalize country codes like "+91" */
export const normalizeCountryCode = (code) => {
  if (!code) return null;
  const digits = String(code).replace(/\D/g, "").replace(/^0+/, "");
  return digits ? `+${digits}` : null;
};

/** Pick price: final_price if >0 else base_price */
export const pickPrice = (entry) => {
  if (!entry) return 0;
  const finalPrice = Number(entry.final_price || 0);
  const basePrice = Number(entry.base_price || 0);
  return finalPrice > 0 ? finalPrice : basePrice;
};

/** Calculate guest message cost dynamically */
export const calculateGuestCost = async (pricingData, countryId, schedules) => {
  const channelConfig = await loadChannelConfig();
  const { byId, byCode } = channelConfig;

  let totalPrice = 0;
  let totalMessages = 0;

  const getPrice = (channelId) => {
    const entry = pricingData.find(
      (p) => Number(p.channel_id) === channelId && Number(p.country_id) === countryId
    );
    return pickPrice(entry);
  };

  for (const schedule of schedules || []) {
    const channelId = Number(schedule.channelType);
    const channel = byId[channelId];
    if (!channel) continue;

    const code = channel.code.toUpperCase();

    // Single channel
    if (!code.includes("|") && !code.includes("&")) {
      totalPrice += getPrice(channelId);
      totalMessages += 1;
      continue;
    }

    const parts = code.split(/[|&]/).map((c) => c.trim().toUpperCase());
    const channelParts = parts.map((part) => byCode[part]).filter(Boolean);

    if (!channelParts.length) continue;

    const prices = channelParts.map((ch) => getPrice(ch.id));

    if (code.includes("|")) {
      totalPrice += Math.min(...prices);
      totalMessages += 1;
    } else if (code.includes("&")) {
      totalPrice += prices.reduce((a, b) => a + b, 0);
      totalMessages += prices.length;
    }
  }

  return { totalPrice, totalMessages };
};
