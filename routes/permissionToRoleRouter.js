import express from "express";
import { assignPermissionToRole } from "../controllers/permissionToRoleController.js";

const router = express.Router();

router.post("/role-permission/store", assignPermissionToRole);

export default router;
