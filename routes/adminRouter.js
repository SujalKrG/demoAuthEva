import express from "express";
import {
  addAdmin,
  // getAllAdmins,
  // getAdminById,
  updateAdminWithRoles,
  updateAdminStatusController,
  getAdminWithRoleAndPermissionsById,

} from "../controllers/adminController.js";
import { getProfile } from "../controllers/authController.js";
import multer from "multer";
const upload = multer();
import authorizeDynamic from "../middlewares/dynamicAuthorizeMiddleware.js";

import authorize from "../middlewares/authorizeMiddleware.js";


const router = express.Router();
router.use(authorizeDynamic());
router.get("/get-profile",getProfile);


router.post("/admin/store", addAdmin);
// router.get("/admin/get", getAllAdmins);
// router.get("/admin/show/:id", getAdminById);
router.get("/admin-role-permission/get", getAdminWithRoleAndPermissionsById);
router.patch("/admin/update/:id",upload.none(), updateAdminWithRoles);
router.patch("/admin/update-status/:id", updateAdminStatusController);


export default router;
