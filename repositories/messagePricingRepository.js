import db from "../models/index.js";

export const createMessagePricingRepo = async (data) => {
  return await db.MessagePricing.create(data);
};
export const getUniqueMessagePricingRepo = async (channel_id, country_id) => {
  return await db.MessagePricing.findOne({
    where: {
      channel_id,
      country_id,
    },
  });
};
