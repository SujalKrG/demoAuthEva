import { tryCatch } from "bullmq";
import db from "../models/index.js";
import handleSequelizeError from "../utils/handelSequelizeError.js";

export const getAllGuestDirectories = async (req, res) => {
  try {
    const guestDirectories = await db.GuestDirectory.findAll();
    res.json(guestDirectories);
  } catch (error) {
    const handled = handleSequelizeError(error, res);
    if (handled) return handled;

    return res.status(500).json({
      message: "Unexpected server error",
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : error.message,
    });
  }
};
