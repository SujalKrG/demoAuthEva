import express from "express";
import { assignPermissionToRole } from "../../controllers/superAdmin/permissionToRoleController.js";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/authorizeMiddleware.js";
import checkAdminStatus from "../../middlewares/statusMiddleware.js";
const router = express.Router();

router.use(authenticate, authorize(["SUPER_ADMIN"]), checkAdminStatus);

router.post("/role-permission/store", assignPermissionToRole);

export default router;
