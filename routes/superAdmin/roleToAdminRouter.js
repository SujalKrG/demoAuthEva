import express from "express";
import { assignRoleToAdmin } from "../../controllers/superAdmin/roleToAdminController.js";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/authorizeMiddleware.js";
import checkAdminStatus from "../../middlewares/statusMiddleware.js";
const router = express.Router();

// router.use(authenticate, authorize(["SUPER_ADMIN"]), checkAdminStatus);

router.post("/admin-role/store", assignRoleToAdmin);

export default router;
