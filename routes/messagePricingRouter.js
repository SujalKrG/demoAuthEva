import express from "express";
import {
  createMessagePricing,
  // getAllMessagePricing,
} from "../controllers/messagePricingController.js";
// import messagePricing from "../models/messagePricing.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createMessagePricingSchema } from "../validations/messagePricingValidation.js";

const router = express.Router();

router.post(
  "/message-pricing/store",
  validateRequest(createMessagePricingSchema),
  createMessagePricing
);
// router.get("/message-pricing/get", getAllMessagePricing);

export default router;
