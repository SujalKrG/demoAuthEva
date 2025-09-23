import express from "express";
import { createRole , getAllRoles} from "../controllers/roleController.js";

const router = express.Router();

router.post("/role/store", createRole);
router.get("/role/get", getAllRoles);

export default router;
