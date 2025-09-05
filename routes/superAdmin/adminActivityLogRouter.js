import express from "express";
import { getAdminActivityLogs } from "../../controllers/superAdmin/adminActivityLogController.js";

const router = express.Router();

router.get("/admin-activity-log/get", getAdminActivityLogs);

export default router;
