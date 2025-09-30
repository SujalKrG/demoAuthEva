import express from "express";
import { createRole , getAllRoles, updateRole} from "../controllers/roleController.js";
import authorizeDynamic from "../middlewares/dynamicAuthorizeMiddleware.js";
const router = express.Router();
// router.use(authorizeDynamic());

router.post("/role/store", createRole);
router.get("/role/get", getAllRoles);
router.patch("/role/update/:id", updateRole);

export default router;
