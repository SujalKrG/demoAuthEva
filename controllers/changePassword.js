import db from "../models/index.js";
import bcrypt from "bcryptjs";
import AppError from "../utils/AppError.js";

const { Admin } = db;

export const changePassword = async (req, res, next) => {
  try {
    if (!req.admin) {
      throw new AppError("Unauthorized. Please login again.", 401);
    }

    const admin = req.admin;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError("Current password and new password are required", 400);
    }

    if (currentPassword === newPassword)
      throw new AppError("New password must be different", 400);
    if (newPassword !== confirmPassword)
      throw new AppError("New password and confirm password do not match", 400);
    if (newPassword.length < 6)
      throw new AppError("New password must be at least 6 characters", 400);

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) throw new AppError("Invalid current password", 401);

    const hashed = await bcrypt.hash(newPassword, 10);

    admin.password = hashed;
    admin.reset_password_otp_expire = null;
    admin.remember_token = null;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully. Please login again.",
    });
  } catch (error) {
    next(error);
  }
};
