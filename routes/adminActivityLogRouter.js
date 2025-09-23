import express from "express";
import {
  getAdminActivityLogs,
  showDetailsById,
} from "../controllers/adminActivityLogController.js";

const router = express.Router();

router.get("/admin-activity-log/get", getAdminActivityLogs);
router.get("/admin-activity-log/show/:id", showDetailsById);

export default router;
