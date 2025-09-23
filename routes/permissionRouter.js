import express from "express";
import { createPermission, getAllPermissions } from "../controllers/permissionController.js";

const router = express.Router();

router.post("/permission/store", createPermission);
router.get("/permission/get", getAllPermissions);

export default router;