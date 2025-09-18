import express from "express";
import { createRole } from "../../controllers/superAdmin/roleController.js";

const router = express.Router();

router.post("/role/store", createRole);

export default router;
