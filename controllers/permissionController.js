import PermissionService from "../services/permissionService.js";

const permissionService = new PermissionService();
import {logger} from "../utils/logger.js";

// POST /permissions
export const createPermission = async (req, res, next) => {
  try {
    const permission = await permissionService.createPermission(req.body);
    res.status(201).json({
      success: true,
      message: "Permission created successfully",
      permission,
    });
  } catch (error) {
    logger.error(`[permission][create] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);

  }
};

// GET /permissions
export const getPermissions = async (req, res, next) => {
  try {
    const permissions = await permissionService.getAllPermissions();
    res.status(200).json({
      success: true,
      permissions,
    });
  } catch (error) {
    logger.error(`[permission][getAll] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
     
  }
};
