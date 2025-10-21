import { createMessageChannelService } from "../services/messageChannelService.js";
import { logger } from "../utils/logger.js";
export const createMessageChannel = async (req, res) => {
  try {
    const result = await createMessageChannelService(req.body);

    return res.status(200).json({
      success: true,
      message: "Message channel created successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`[message channel][create] ${error.message}`, {
      name: error.name,
      stack: error.stack,
      body: req.body,
    });
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
