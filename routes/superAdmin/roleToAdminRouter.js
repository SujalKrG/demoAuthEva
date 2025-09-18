import express from "express";
import { assignRoleToAdmin } from "../../controllers/superAdmin/roleToAdminController.js";

const router = express.Router();

router.post("/admin-role/store", assignRoleToAdmin);

export default router;
