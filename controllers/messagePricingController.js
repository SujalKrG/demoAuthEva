import {
  createMessagePricingService,
  getAllMessagePricingService,
} from "../services/messagePricingService.js";
import handleSequelizeError from "../utils/handelSequelizeError.js";
export const createMessagePricing = async (req, res) => {
  try {
    const result = await createMessagePricingService(req.body);
    return res.status(201).json({
      success: true,
      message: "Message pricing created successfully",
      data: result,
    });
  } catch (error) {
    if (error.name?.startsWith("Sequelize")) {
      throw handleSequelizeError(error);
    }
    throw error;
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
    if (error.name?.startsWith("Sequelize")) {
      throw handleSequelizeError(error);
    }
    throw error;
  }
};
