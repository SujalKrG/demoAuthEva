import bcrypt from "bcryptjs";
import { findAdminByEmail, findAdminsWithValidOTP, saveAdmin } from "../repositories/forgotPassRepository.js";
import nodemailer from "nodemailer";

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
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
  if (!admin) return { message: "Email does not exist" }; // generic response for security

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  admin.resetPasswordOTP = await bcrypt.hash(otp, 10);
  admin.resetPasswordOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
  await saveAdmin(admin);

  await sendOTPEmail(email, otp);

  return { message: "OTP sent to your email" };
};

export const resetPasswordWithOTPService = async ({ otp, newPassword }) => {
  if (!otp || !newPassword) throw new Error("OTP and new password are required");

  const candidates = await findAdminsWithValidOTP();
  if (!candidates || candidates.length === 0) throw new Error("Invalid or expired OTP");

  let matchedUser = null;
  for (const user of candidates) {
    if (await bcrypt.compare(otp, user.resetPasswordOTP || "")) {
      matchedUser = user;
      break;
    }
  }
  if (!matchedUser) throw new Error("Invalid or expired OTP");

  matchedUser.password = await bcrypt.hash(newPassword, 10);
  matchedUser.resetPasswordOTP = null;
  matchedUser.resetPasswordOTPExpires = null;

  await saveAdmin(matchedUser);

  return { message: "Password reset successful" };
};
