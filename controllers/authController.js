import {
  loginService,
  logoutService,
  changePasswordService,
  getProfileService,
} from "../services/authService.js";

export const login = async (req, res) => {
  try {
    const result = await loginService(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken: result.accessToken,
      admin: result.admin,
    });
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
    res
      .status(500)
      .json({ success: false, message: "Logout failed", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    if (!req.admin?.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

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

export const getProfile = async (req, res) => {
  try {
    if (!req.admin?.id) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    const adminProfile = await getProfileService(req.admin.id);

    res.status(200).json({ success: true, admin: adminProfile });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
