import {
  createPermissionsService,
  getAllPermissionsService,
} from "../services/permissionService.js";

export const createPermission = async (req, res) => {
  try {
    const result = await createPermissionsService(req.body.names);

    res.status(201).json({
      success: true,
      message: result.message,
      added: result.added,
      skipped: result.skipped,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const getAllPermissions = async (req, res) => {
  try {
    const result = await getAllPermissionsService();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};








