import express from "express";
import { addAdmin,getAllAdmins,getAdminById, updateAdmin } from "../controllers/adminController.js";
import { getAdminWithRoleAndPermissionsById } from "../controllers/adminController.js";


const router = express.Router();


router.post("/admin/store", addAdmin);
router.get("/admin/get", getAllAdmins);
router.get("/admin/show/:id", getAdminById);
router.get("/admin-role-permission/get",getAdminWithRoleAndPermissionsById)
router.patch("/admin/update/:id",updateAdmin)


export default router;