import { createMessageChannelService } from "../services/messageChannelService.js";
import { logger } from "../utils/logger.js";
import db from "../models/index.js";
import { Op } from "sequelize";
export const createMessageChannel = async (req, res, next) => {
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
      // stack: error.stack,
      body: req.body,
    });
    console.error(error);
    next(error);
  }
};
export const getAllMessageChannels = async (req, res, next) => {
  try {
    const { search, status, provider } = req.query;

    // 🔹 Validate query parameters
    if (status && !["true", "false", "1", "0"].includes(status)) {
      return next(
        new AppError("Invalid status value. Use true/false or 1/0.", 400)
      );
    }

    if (provider && typeof provider !== "string") {
      return next(
        new AppError("Invalid provider value. Must be a string.", 400)
      );
    }

    if (search && typeof search !== "string") {
      return next(new AppError("Invalid search value. Must be a string.", 400));
    }

    // 🔹 Build where clause
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { provider: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status !== undefined) {
      whereClause.status = status === "true" || status === "1";
    }

    if (provider) {
      whereClause.provider = provider;
    }

    // 🔹 Fetch data
    const channels = await db.MessageChannel.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
    });

    // 🔹 Handle empty data
    if (!channels || channels.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No message channels found.",
        data: [],
      });
    }

    // ✅ Success response
    return res.status(200).json({
      success: true,
      message: "Message channels fetched successfully.",
      data: channels,
    });
  } catch (error) {
    logger.error(`[message channel][getAll] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};
