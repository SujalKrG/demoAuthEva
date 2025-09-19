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
    const guestGroup = await db.GuestGroup.create({
      user_id,
      name,
    });
    res.status(201).json({
      success: true,
      message: "Guest group created successfully",
      data: guestGroup,
    });

    

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


export const getAllGuestGroups = async (req, res) => {
  try {
    const guestGroups = await db.GuestGroup.findAll();
    res.json(guestGroups);
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
  
}