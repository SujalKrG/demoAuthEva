// userController.js
import { Sequelize, remoteSequelize } from "../models/index.js";
import db from "../models/index.js";
import { Op, where } from "sequelize";
import handleSequelizeError from "../utils/handelSequelizeError.js";
// Import remote User model factory
import UserModelFactory from "../models/remote/user.js";

// Initialize remote User model with remoteSequelize
const RemoteUser = UserModelFactory(remoteSequelize, Sequelize.DataTypes);

// ✅ Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await RemoteUser.findAll({
      attributes: ["id", "name", "email", "mobile", "status"], // select only required fields
      order: [["id", "DESC"]],
    });

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No users found" });
    }

    return res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error("Error fetching remote users:", error);

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
