import bcrypt from "bcryptjs";
import db from "../models/index.js";
import AppError from "../utils/AppError.js";
import { sendEmail } from "../utils/sendEmail.js";
import { tempPasswordEmailTemplate } from "../utils/tempPasswordEmail.js";

const { Admin } = db;

export const resetAdminPasswordBySA = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      throw new AppError("New password and confirm password do not match", 400);
    }
    if (password.length < 6) {
      throw new AppError("New password must be at least 6 characters", 400);
    }
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    admin.password = hashedPassword;
    admin.remember_token = null;
    admin.reset_password_otp_expire = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await admin.save();
    const html = tempPasswordEmailTemplate(admin.name, password);
    await sendEmail(admin.email, "Password Reset", html);
    res.status(200).json({
      success: true,
      message: "temporary password has been set and emailed to the admin.",
    });
    
  } catch (error) {
    next(error);
  }
};
