import express from "express";
import { createRole , getAllRoles, updateRole} from "../controllers/roleController.js";

const router = express.Router();

router.post("/role/store", createRole);
router.get("/role/get", getAllRoles);
router.patch("/role/update/:id", updateRole);

export default router;
