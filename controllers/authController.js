
import { loginService, logoutService, changePasswordService } from "../services/authService.js";

export const login = async (req, res) => {
  try {
    const result = await loginService(req.body);
    res.status(200).json({ success: true, message: "Login successful", accessToken: result.accessToken, admin: result.admin });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const message = await logoutService(token);
    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: "Logout failed", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    if (!req.admin?.id) return res.status(401).json({ success: false, message: "Unauthorized" });

    const message = await changePasswordService({
      adminId: req.admin.id,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    });

    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};





// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import db from "../models/index.js";
// import dotenv from "dotenv";
// import handleSequelizeError from "../utils/handelSequelizeError.js";
// import logActivity from "../utils/logActivity.js";

// dotenv.config();

// // Utility to generate JWT
// const generateAccessToken = (user) => {
//   return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
// };

// // LOGIN controller
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email and password are required" });
//     }

//     const admin = await db.Admin.findOne({
//       where: { email },
//       include: [
//         {
//           model: db.Role,
//           as: "roles",
//           attributes: ["code"],
//           include: [
//             {
//               model: db.Permission,
//               as: "permissions",
//               attributes: ["name"],
//               through: { attributes: [] },
//             },
//           ],
//         },
//       ],
//     });

//     if (!admin)
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid email or password" });
//     if (!admin.status) {
//       return res.status(403).json({
//         success: false,
//         message: "Account is inactive, contact super admin",
//       });
//     }
//     console.log(admin);

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch)
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid email or password" });

//     if (!process.env.JWT_SECRET) {
//       return res
//         .status(500)
//         .json({ success: false, message: "JWT_SECRET not configured" });
//     }

//     const roles = admin.roles.map((r) => r.code);
//     const permissions = admin.roles.flatMap((r) =>
//       r.permissions.map((p) => p.code)
//     );

//     const adminToken = generateAccessToken({
//       id: admin.id,
//       email: admin.email,
//       roles,
//       permissions,
//     });

//     const accessToken = generateAccessToken(admin);
//     admin.remember_token = accessToken;
//     await admin.save();
//     logActivity({
//       created_by: admin.id,
//       action: "LOGIN",
//       module: "Admin",
//     });

//     res.json({
//       success: true,
//       message: "Login successful",
//       accessToken,
//       admin: {
//         id: admin.id,
//         email: admin.email,
//         roles: admin.roles,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong. Please try again later.",
//     });
//   }
// };

// // LOGOUT controller
// export const logout = async (req, res) => {
//   try {
//     const headerToken = req.headers.authorization?.split(" ")[1];

//     //if no token provided
//     if (!headerToken) {
//       return res
//         .status(200)
//         .json({ success: true, message: "Logout successful(no token)" });
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(headerToken, process.env.JWT_SECRET);
//     } catch (error) {
//       if (error.name === "TokenExpiredError") {
//         decoded = jwt.decode(headerToken);
//       } else {
//         return res.status(200).json({
//           success: true,
//           message: "Logout successful (invalid token)",
//         });
//       }
//     }
//     //decoded token doesn't have id
//     if (!decoded?.id) {
//       return res
//         .status(200)
//         .json({ success: true, message: "Logout successful (no user id)" });
//     }

//     // user lookup
//     const admin = await db.Admin.findByPk(decoded.id);
//     if (!admin) {
//       return res
//         .status(200)
//         .json({ success: true, message: "Logout successful (user not found)" });
//     }

//     if (decoded?.id) {
//       if (admin && admin.remember_token === headerToken) {
//         admin.remember_token = null;
//         await admin.save();
//       }
//     }

//     return res
//       .status(200)
//       .json({ success: true, message: "Logout successful" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: "Logout failed" });
//   }
// };

// // CHANGE PASSWORD controller
// export const changePassword = async (req, res) => {
//   try {
//     if (!req.admin || !req.admin.id) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized: Admin not logged in",
//       });
//     }
//     const adminId = req.admin.id;
//     const { currentPassword, newPassword } = req.body;

//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "Current and new passwords are required",
//       });
//     }

//     if (newPassword.length < 8) {
//       return res.status(400).json({
//         success: false,
//         message: "New password must be at least 6 characters long",
//       });
//     }
//     if (currentPassword === newPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "New password must be different from current password",
//       });
//     }

//     const admin = await db.Admin.findByPk(adminId);
//     if (!admin) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Admin not found" });
//     }

//     const isMatch = await bcrypt.compare(currentPassword, admin.password);
//     if (!isMatch) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Current password is incorrect" });
//     }

//     const hashedNewPassword = await bcrypt.hash(newPassword, 10);
//     admin.password = hashedNewPassword;
//     await admin.save({
//       individualHooks: true,
//       userId: req.admin?.id,
//     });

//     res.json({ success: true, message: "Password changed successfully" });
//   } catch (error) {
//     console.error(error);
//     handleSequelizeError(error, res);

//     // Handle Sequelize errors
//     const handled = handleSequelizeError(error, res);
//     if (handled) return handled;

//     // Handle generic Node.js / unexpected errors
//     return res.status(500).json({
//       message: "Unexpected server error",
//       error:
//         process.env.NODE_ENV === "production"
//           ? "Internal Server Error"
//           : error.message,
//     });
//   }
// };
