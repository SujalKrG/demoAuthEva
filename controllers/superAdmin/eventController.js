import db from "../../models/index.js";
import handleSequelizeError from "../../utils/handelSequelizeError.js";
import { cleanString } from "../../utils/occasionResource.js";

export const getAllEvents = async (req, res) => {
  try {
    if (!db.Event) {
      throw new Error("Event model is not initialized");
    }

    const events = await db.Event.findAll();
    if (!events || events.length === 0) {
      return res.status(404).json({ success: false, message: "No events found", data: [] });
    }
    res.status(200).json({ success: true, message: "Events retrieved successfully", data: events });
  } catch (error) {
    console.log(error);

    // Handle Sequelize errors
    const handled = handleSequelizeError(error, res);
    if (handled) return handled;

    // Handle generic Node.js / unexpected errors
    return res.status(500).json({
      message: "Unexpected server error",
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : error.message,
    });
  }
};

export const getUserWithEvents = async (req, res) => {}