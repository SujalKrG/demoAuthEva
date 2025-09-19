import handleSequelizeError from "../../utils/handelSequelizeError.js";
import db from "../../models/index.js";

export const createGuestGroups = async (req, res) => {
  try {
    const { user_id, name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }
    

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
