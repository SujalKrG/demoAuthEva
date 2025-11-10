// controllers/admin.controller.js
import { AdminService } from "../services/adminService.js";
import { logger } from "../utils/logger.js";

export const addAdmin = async (req, res, next) => {
  try {
    const admin = await AdminService.createAdmin(req.body);
    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: admin,
    });
  } catch (error) {
    logger.error(`[addAdmin] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });

    next(error);
  }
};

export const getAdminWithRoleAndPermissionsById = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const data = await AdminService.getAdminWithRoleAndPermissions({
      role,
      status,
      search,
    });
    return res
      .status(200)
      .json({ success: true, message: "Fetched successfully", data });
  } catch (error) {
    logger.error(`[getAdminWithRoleAndPermissionsById] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const updateAdminWithRoles = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { roles } = req.body;

    if (typeof roles === "string") {
      if (roles.trim().startsWith("[")) {
        roles = JSON.parse(roles);
      } else {
        roles = roles.split(",").map((r) => parseInt(r.trim(), 10));
      }
    }

    const updatedAdmin = await AdminService.updateAdmin(id, {
      ...req.body,
      roles,
    });

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res
      .status(200)
      .json({ message: "Admin updated successfully", data: updatedAdmin });
  } catch (error) {
    logger.error(`[updateAdminWithRoles] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};

export const updateAdminStatusController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await AdminService.updateAdminStatus(id, status);

    if (!updated) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Admin status updated successfully",
    });
  } catch (error) {
    logger.error(`[updateAdminStatusController] ${error.message}`, {
    name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
    
  }
};
