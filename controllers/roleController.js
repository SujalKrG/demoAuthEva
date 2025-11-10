import {
  createRoleService,
  getAllRolesService,
  updateRoleWithPermissionsService,
  
} from "../services/roleService.js";
import {logger} from "../utils/logger.js";

export const createRole = async (req, res, next) => {
  try {
    const role = await createRoleService(req.body);
    res.status(201).json({
      success: true,
      message: "Role created successfully with permissions",
      role,
    });
  } catch (error) {
    logger.error(`[role][create] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
    
  }
};

export const getAllRoles = async (req, res) => {
  try {
    const roles = await getAllRolesService();
    res.status(200).json({ success: true, roles });
  } catch (error) {
    logger.error(`[role][getAll] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
    
  }
};


export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await updateRoleWithPermissionsService(id, req.body);

    if (result?.error) {
      return res.status(result.status || 400).json({
        success: false,
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.role,
      changes: result.permissionUpdateResult, // { added: [], removed: [], alreadyAssigned: [] }
    });
  } catch (error) {
    logger.error(`[role][update] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
    
  }
};
