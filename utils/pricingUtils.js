// utils/pricingUtils.js

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

/** Calculate cost per guest per schedule */
export const calculateGuestCost = (pricingData, countryId, schedules) => {
  let totalPrice = 0;
  let totalMessages = 0;

  const waPrice = pickPrice(pricingData.find(p => Number(p.channel_id) === 1 && Number(p.country_id) === countryId)) || 0;
  const rcsPrice = pickPrice(pricingData.find(p => Number(p.channel_id) === 2 && Number(p.country_id) === countryId)) || 0;

  schedules?.forEach((s) => {
    const type = Number(s.channelType);
    switch (type) {
      case 1: totalPrice += waPrice; totalMessages += 1; break;
      case 2: totalPrice += rcsPrice; totalMessages += 1; break;
      case 3: totalPrice += Math.max(waPrice, rcsPrice); totalMessages += 1; break;
      case 4: totalPrice += waPrice + rcsPrice; totalMessages += 2; break;
    }
  });

  return { totalPrice, totalMessages };
};
