import { requestPasswordOTPService, resetPasswordWithOTPService } from "../services/forgotPassService.js";

export const requestPasswordOTP = async (req, res) => {
  try {
    const result = await requestPasswordOTPService(req.body.email);
    res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    console.error("Request OTP Error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const resetPasswordWithOTP = async (req, res) => {
  try {
    const result = await resetPasswordWithOTPService(req.body);
    res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};






// import bcrypt from "bcryptjs";
// import { Op } from "sequelize";
// import db from "../models/index.js";
// import nodemailer from "nodemailer";

// /**
//  * Utility: Send OTP email
//  */
// const sendOTPEmail = async (email, otp) => {
//   const transporter = nodemailer.createTransport({
//     service: process.env.EMAIL_SERVICE || "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   await transporter.sendMail({
//     to: email,
//     subject: "Password Reset OTP",
//     html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 10 minutes.</p>`,
//   });
// };

// /**
//  * 1. Request OTP
//  */
// export const requestPasswordOTP = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email is required" });
//     }

//     const admin = await db.Admin.findOne({ where: { email } });

//     if (!admin) {
//       // Always respond the same for security
//       return res.status(200).json({
//         success: true,
//         message: "email is not exist",
//       });
//     }   

//     // Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     // Save hashed OTP + expiry
//     admin.resetPasswordOTP = await bcrypt.hash(otp, 10);
//     admin.resetPasswordOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
//     await admin.save();

//     try {
//       // Send OTP email
//     await sendOTPEmail(email, otp);

//     return res.json({
//       success: true,
//       message: "OTP sent to your email",
//     });
//     } catch (error) {
//       console.error("Send OTP Email Error:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to send OTP email",
//       });
//     }
//   } catch (err) {
//     console.error("Request OTP Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error, please try again later",
//     });
//   }
// };

// export const resetPasswordWithOTP = async (req, res) => {
//   try {
//     const { otp, newPassword } = req.body;

//     if (!otp || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP and new password are required",
//       });
//     }

//     // Find all users with non-expired OTPs
//     const candidates = await db.Admin.findAll({
//       where: {
//         resetPasswordOTPExpires: { [Op.gt]: new Date() },
//       },
//     });

//     if (!candidates || candidates.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired OTP",
//       });
//     }

//     // Try to find a matching OTP
//     let matchedUser = null;
//     for (const user of candidates) {
//       const isMatch = await bcrypt.compare(otp, user.resetPasswordOTP || "");
//       if (isMatch) {
//         matchedUser = user;
//         break;
//       }
//     }

//     if (!matchedUser) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired OTP",
//       });
//     }

//     // Update password
//     matchedUser.password = await bcrypt.hash(newPassword, 10);

//     // Clear OTP fields
//     matchedUser.resetPasswordOTP = null;
//     matchedUser.resetPasswordOTPExpires = null;
//     await matchedUser.save();

//     return res.json({
//       success: true,
//       message: "Password reset successful",
//     });
//   } catch (err) {
//     console.error("Reset Password Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error, please try again later",
//     });
//   }
// };
