import bcrypt from "bcryptjs";
import {
  findAdminByEmail,
  findAdminWithValidOTP,
  saveAdmin,
} from "../repositories/forgotPassRepository.js";
import nodemailer from "nodemailer";

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // ⚠️ Use App Password for Gmail
    },
  });

  await transporter.sendMail({
    to: email,
    subject: "Password Reset OTP",
    html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 10 minutes.</p>`,
  });
};

export const requestPasswordOTPService = async (email) => {
  if (!email) throw new Error("Email is required");

  const admin = await findAdminByEmail(email);
  if (!admin) return { message: "If the email exists, an OTP was sent" }; // generic for security

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  admin.reset_password_OTP = await bcrypt.hash(otp, 10);
  admin.reset_password_OTP_expire = new Date(Date.now() + 10 * 60 * 1000);

  await saveAdmin(admin);
  await sendOTPEmail(email, otp);

  return { message: "If the email exists, an OTP was sent" };
};

export const resetPasswordWithOTPService = async ({
  email,
  otp,
  newPassword,
}) => {
  if (!email || !otp || !newPassword) {
    throw new Error("Email, OTP, and new password are required");
  }

  const admin = await findAdminWithValidOTP(email);
  if (!admin) throw new Error("Invalid or expired OTP");

  const isMatch = await bcrypt.compare(otp, admin.reset_password_OTP || "");
  if (!isMatch) throw new Error("Invalid or expired OTP");

  admin.password = await bcrypt.hash(newPassword, 10);
  admin.reset_password_OTP = null;
  admin.reset_password_OTP_expire = null;

  await saveAdmin(admin);

  return { message: "Password reset successful" };
};
