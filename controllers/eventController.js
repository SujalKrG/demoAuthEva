import { getAllEventsService } from "../services/eventService.js";
import handleSequelizeError from "../utils/handelSequelizeError.js";
import { logger } from "../utils/logger.js";

export const getAllEvents = async (req, res, next) => {
  try {
    const result = await getAllEventsService(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    logger.error(`[event][getAll] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};
