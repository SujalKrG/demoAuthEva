import express from "express";
import { assignRoleToAdmin } from "../controllers/roleToAdminController.js";

const router = express.Router();

router.post("/admin-role/store", assignRoleToAdmin);

export default router;
