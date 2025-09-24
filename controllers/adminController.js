import {
  addAdminService,
  getAllAdminsService,
  getAdminByIdService,
  getAdminWithRoleAndPermissionsService,
  updateAdminService,
  updateAdminStatusService,
} from "../services/adminService.js";
import { logger } from "../utils/logger.js";

export const addAdmin = async (req, res) => {
  try {
    const admin = await addAdminService(req.body);
    res
      .status(201)
      .json({ success: true, message: "Admin created successfully", admin });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await getAllAdminsService();
    res.status(200).json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const admin = await getAdminByIdService(req.params.id);
    res.status(200).json({ success: true, admin });
  } catch (error) {
    res
      .status(error.message === "Admin not found" ? 404 : 500)
      .json({ success: false, message: error.message });
  }
};
// controllers/adminController.js


export const getAdminWithRoleAndPermissionsById = async (req, res) => {
  try {
    const { role, status, search } = req.query;

    const data = await getAdminWithRoleAndPermissionsService({
      role,
      status,
      search,
    });

    res.status(200).json({
      success: true,
      message: "Fetched successfully",
      data,
    });
  } catch (error) {
    // const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(404).json({
      success: false,
      message: "Admin not found",
    });
  }
};


export const updateAdmin = async (req, res) => {};

export const updateAdminWithRoles = async (req, res) => {
  try {
    const { id } = req.params;

    let roles = req.body.roles;

    // 🛠 Normalize roles
    if (typeof roles === "string") {
      try {
        // Case 1: JSON stringified array -> "[1,2]"
        if (roles.trim().startsWith("[")) {
          roles = JSON.parse(roles);
        } else {
          // Case 2: Comma separated string -> "1,2,3"
          roles = roles.split(",").map((r) => parseInt(r.trim(), 10));
        }
      } catch (err) {
        return res.status(400).json({ message: "Invalid roles format" });
      }
    }

    const payload = {
      ...req.body,
      roles,
    };

    const updatedAdmin = await updateAdminService(id, payload);

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      message: "Admin updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    logger.error(`[updateAdminController] ${error.message}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateAdminStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedAdmin = await updateAdminStatusService(id, status);

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      message: "Admin status updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    logger.error(`[updateAdminStatusController] ${error.message}`);

    if (error.message.includes("Status is required")) {
      return res.status(400).json({ message: error.message });
    }
    console.log(error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};
