import {
  createMessagePricingRepo,
  getUniqueMessagePricingRepo,
  getAllMessagePricingRepo
} from "../repositories/messagePricingRepository.js";
import AppError from "../utils/AppError.js";
import handelSequelizeError from "../utils/handelSequelizeError.js";


export const createMessagePricingService = async (data) => {
  const { channel_id, country_id, base_price, final_price, currency, status } =
    data;

  if (!channel_id || !country_id || !base_price) {
    throw new AppError("Missing required fields", 400);
  }
  const existingPricing = await getUniqueMessagePricingRepo(
    channel_id,
    country_id
  );
  if (existingPricing) {
    throw new AppError("Message pricing already exists", 400);
  }

  const messagePricing = await createMessagePricingRepo({
    channel_id,
    country_id,
    base_price,
    final_price: final_price ?? null,
    currency: currency ?? "INR",
    status: status ?? 1,
  });

  return messagePricing;
};


export const getAllMessagePricingService = async () => {
  return await getAllMessagePricingRepo();
};