import { getAllEventsService } from "../services/eventService.js";
import handleSequelizeError from "../utils/handelSequelizeError.js";

export const getAllEvents = async (req, res) => {
  try {
    const result = await getAllEventsService(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    const handled = handleSequelizeError(error, res);
    if (handled) return handled;

    res.status(500).json({
      success: false,
      message: "Unexpected server error",
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : error.message,
    });
  }
};
