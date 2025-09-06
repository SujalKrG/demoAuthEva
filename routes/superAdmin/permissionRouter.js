import express from "express";
import { createPermission } from "../../controllers/superAdmin/permissionController.js";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/authorizeMiddleware.js";
import checkAdminStatus from "../../middlewares/statusMiddleware.js";
const router = express.Router();

// router.use(authenticate, authorize(["SUPER_ADMIN"]), checkAdminStatus);

router.post("/permission/store", createPermission);
export default router;