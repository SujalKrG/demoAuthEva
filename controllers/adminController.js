// controllers/admin.controller.js
import { AdminService } from "../services/adminService.js";
import { logger } from "../utils/logger.js";

export const addAdmin = async (req, res) => {
  try {
    const admin = await AdminService.createAdmin(req.body);
    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: admin,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create admin",
    });
  }
};

export const getAdminWithRoleAndPermissionsById = async (req, res) => {
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
    return res
      .status(404)
      .json({ success: false, message: "Admin not found" });
  }
};

export const updateAdminWithRoles = async (req, res) => {
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
    logger.error(`[updateAdminController] ${error.message}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateAdminStatusController = async (req, res) => {
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
    logger.error(`[updateAdminStatusController] ${error.message}`);
    if (error.message.includes("Status is required")) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
