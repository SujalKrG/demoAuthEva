import { createMessagePricingService } from "../services/messagePricingService.js";
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

    // console.error("error creating message pricing", error);
    // if (error.isOperational) {
    //   return res.status(error.statusCode || 400).json({
    //     success: false,
    //     message: error.message,
    //   });
    // }

    // return res.status(500).json({
    //   success: false,
    //   message: "Internal Server Error",
    // });
  }
};
