import {
  createMessagePricingService,
  getAllMessagePricingService,
} from "../services/messagePricingService.js";
import handleSequelizeError from "../utils/handelSequelizeError.js";
import { logger } from "../utils/logger.js";
export const createMessagePricing = async (req, res, next) => {
  try {
    const result = await createMessagePricingService(req.body);
    return res.status(201).json({
      success: true,
      message: "Message pricing created successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`[message pricing][create] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
    
   
  }
};

export const getAllMessagePricing = async (req, res) => {
  try {
    const result = await getAllMessagePricingService();
    return res.status(200).json({
      success: true,
      message: "Message pricing fetched successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`[message pricing][getAll] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};
