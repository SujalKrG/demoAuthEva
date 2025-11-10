import { assignPermissionToRoleService } from "../services/rolePermissionService.js";
import {logger} from "../utils/logger.js";

export const assignPermissionToRole = async (req, res, next) => {
  try {
    const result = await assignPermissionToRoleService(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    logger.error(`[permission to role][assign] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};
