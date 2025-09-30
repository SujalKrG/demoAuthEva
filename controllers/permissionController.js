import PermissionService from "../services/permissionService.js";

const permissionService = new PermissionService();

// POST /permissions
export const createPermission = async (req, res) => {
  try {
    const permission = await permissionService.createPermission(req.body);
    res.status(201).json({
      success: true,
      message: "Permission created successfully",
      permission,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /permissions
export const getPermissions = async (req, res) => {
  try {
    const permissions = await permissionService.getAllPermissions();
    res.status(200).json({
      success: true,
      permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
