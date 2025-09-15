import express from "express";
import { getAdminActivityLogs } from "../../controllers/superAdmin/adminActivityLogController.js";
import authenticate from "../../middlewares/authMiddleware.js"; 
import authorize from "../../middlewares/authorizeMiddleware.js";
import checkAdminStatus from "../../middlewares/statusMiddleware.js";
const router = express.Router();
// router.use(authenticate,authorize(["SUPER_ADMIN"]),checkAdminStatus)
router.get("/admin-activity-log/get", getAdminActivityLogs);

export default router;
