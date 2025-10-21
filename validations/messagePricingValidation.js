import { z } from "zod";

export const createMessagePricingSchema = z.object({
  channel_id: z.number().int().positive("Invalid channel_id"),
  country_id: z.number().int().positive("Invalid country_id"),
  base_price: z.number().nonnegative("Base price must be >= 0"),
  final_price: z.number().optional(),
  currency: z.string().optional().default("INR"),
  status: z.number().int().optional().default(1),
});
