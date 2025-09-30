// controllers/adminRoleController.js
import { assignRoleToAdminService } from "../services/adminRoleService.js";

export const assignRoleToAdmin = async (req, res) => {
  try {
    const result = await assignRoleToAdminService(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
