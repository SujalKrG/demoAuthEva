// controllers/adminRoleController.js
import { assignRoleToAdminService } from "../services/adminRoleService.js";
import {logger} from "../utils/logger.js";

export const assignRoleToAdmin = async (req, res, next) => {
  try {
    const result = await assignRoleToAdminService(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    logger.error(`[role to admin][assign] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
    
  }
};
