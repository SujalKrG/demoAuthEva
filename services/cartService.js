import db from "../models/index.js";
import {
  safeParseGuestJson,
  computeMessageCounts,
  findCountryByDialCode,
  getMessageUnitPrice,
} from "../utils/priceHelpers.js";

export const getCartSummaryByUser = async (userId) => {
  // ✅ Fetch all active carts for this user
  const carts = await db.Cart.findAll({
    where: { user_id: userId },
    order: [["created_at", "DESC"]],
    include: [
      {
        model: db.UserTheme,
        as: "user_theme",
        include: [
          {
            model: db.Theme,
            as: "theme",
            include: [
              { model: db.ThemeCategory, as: "themeCategory", required: false },
              { model: db.ThemeType, as: "themeType", required: false },
            ],
          },
        ],
      },
      {
        model: db.Event,
        as: "event",
      },
    ],
  });

  if (!carts?.length) return { carts: [], summary: {} };

  let globalSubtotal = 0;
  const cartResults = [];

  for (const cart of carts) {
    const guestJson = safeParseGuestJson(cart.guest_with_schedules);
    const { breakdown } = computeMessageCounts(guestJson);
    const pricingBreakdown = [];

    let cartTotal = 0;

    // 🧮 Calculate message pricing by channel & country
    for (const [channelType, countries] of Object.entries(breakdown)) {
      for (const [countryCode, messageCount] of Object.entries(countries)) {
        const country = await findCountryByDialCode(countryCode);
        const countryId = country ? country.id : null;
        const unitPrice = await getMessageUnitPrice(channelType, countryId);
        const subtotal = unitPrice * messageCount;

        pricingBreakdown.push({
          channelType: Number(channelType),
          countryCode,
          messageCount,
          unitPrice: Number(unitPrice.toFixed(2)),
          subtotal: Number(subtotal.toFixed(2)),
        });

        cartTotal += subtotal;
      }
    }

    // 🎨 Add theme cost if not purchased
    let themePrice = 0;
    let themeDetails = null;
    const userTheme = cart?.user_theme;
    const theme = userTheme?.theme;

    if (theme) {
      themePrice =
        !userTheme.purchased_price || userTheme.purchased_price === 0
          ? Number(theme.offer_price || theme.base_price || 0)
          : 0;

      themeDetails = {
        id: theme.id,
        name: theme.name,
        category: theme.themeCategory?.name || null,
        type: theme.themeType?.name || null,
        price: Number(themePrice.toFixed(2)),
        isPurchased: themePrice === 0 ? true : false,
      };
    }

    const messageTotal = pricingBreakdown.reduce(
      (sum, i) => sum + i.subtotal,
      0
    );

    const totalCartPrice = messageTotal + themePrice;
    globalSubtotal += totalCartPrice;

    cartResults.push({
      cartId: cart.id,
      event: {
        id: cart.event?.id,
        name: cart.event?.name || "Untitled Event",
      },
      theme: themeDetails,
      messagePricingBreakdown: pricingBreakdown,
      messageTotal: Number(messageTotal.toFixed(2)),
      themePrice: Number(themePrice.toFixed(2)),
      cartTotal: Number(totalCartPrice.toFixed(2)),
    });
  }

  // 🧾 Calculate global summary
  const gst = Number((globalSubtotal * 0.18).toFixed(2));
  const totalAmount = Number((globalSubtotal + gst).toFixed(2));

  const summary = {
    subtotal: Number(globalSubtotal.toFixed(2)),
    gst,
    designFee: 0,
    digitalDelivery: "FREE",
    totalAmount,
  };

  return { carts: cartResults, summary };
};
