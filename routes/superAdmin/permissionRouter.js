import express from "express";
import { createPermission } from "../../controllers/superAdmin/permissionController.js";

const router = express.Router();

router.post("/permission/store", createPermission);
export default router;