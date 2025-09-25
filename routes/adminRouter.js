import express from "express";
import {
  addAdmin,
  getAllAdmins,
  getAdminById,
  updateAdminWithRoles,
  updateAdminStatusController,
  getAdminWithRoleAndPermissionsById,
} from "../controllers/adminController.js";
import multer from "multer";
const upload = multer();

import authorize from "../middlewares/authorizeMiddleware.js";


const router = express.Router();

router.post("/admin/store",authorize([1]), addAdmin);
// router.get("/admin/get", getAllAdmins);
// router.get("/admin/show/:id", getAdminById);
router.get("/admin-role-permission/get",authorize([1]), getAdminWithRoleAndPermissionsById);
router.patch("/admin/update/:id",upload.none(),authorize([1]), updateAdminWithRoles);
router.patch("/admin/update-status/:id",authorize([1]), updateAdminStatusController);


export default router;
