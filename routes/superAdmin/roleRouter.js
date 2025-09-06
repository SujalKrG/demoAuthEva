import express from "express";
import { createRole } from "../../controllers/superAdmin/roleController.js";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/authorizeMiddleware.js";
import checkAdminStatus from "../../middlewares/statusMiddleware.js";
const router = express.Router();

// router.use(authenticate, authorize(["SUPER_ADMIN"]), checkAdminStatus);

router.post("/role/store", createRole);

export default router;
