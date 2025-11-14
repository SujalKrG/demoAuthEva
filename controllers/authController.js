import {
  loginService,
  logoutService,
  getProfileService,
} from "../services/authService.js";
import { logger } from "../utils/logger.js";


export const login = async (req, res, next) => {
  try {
    const result = await loginService(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken: result.token,
      must_change_password: Boolean(result.admin.reset_password_otp_expire),
    });
  } catch (error) {
    logger.error(`[login] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const message = await logoutService(token);
    res.status(200).json({ success: true, message });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Logout failed", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    if (!req.admin?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const adminProfile = await getProfileService(req.admin.id);

    res.status(200).json({ success: true, admin: adminProfile });
  } catch (error) {
    logger.error(`[getProfile] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};
