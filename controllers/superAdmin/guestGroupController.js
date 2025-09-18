import handleSequelizeError from "../../utils/handelSequelizeError.js";
import db from "../../models/index.js";

export const createGuestGroups = async (req, res) => {
  try {
    const {user_id, name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });


    }
  } catch (error) {}
};
