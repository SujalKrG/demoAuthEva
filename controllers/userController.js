// userController.js
import { Sequelize, remoteSequelize } from "../models/index.js";
import db from "../models/index.js";
import { Op, where } from "sequelize";
import handleSequelizeError from "../utils/handelSequelizeError.js";
// Import remote User model factory
import UserModelFactory from "../models/remote/user.js";
import AppError from "../utils/AppError.js";

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
   throw new AppError(error.message, error.statusCode || 500);
   
  }
};
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await RemoteUser.findByPk(id, {
        
      attributes: ["id", "name"],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching remote user by ID:", error);
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