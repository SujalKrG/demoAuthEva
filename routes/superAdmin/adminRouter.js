import express from "express";
import { addAdmin,getAllAdmins,getAdminById } from "../../controllers/superAdmin/adminController.js";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/authorizeMiddleware.js";
import checkAdminStatus from "../../middlewares/statusMiddleware.js";
import { getAdminWithRoleAndPermissionsById } from "../../controllers/superAdmin/adminController.js";


const router = express.Router();
router.use(authenticate, authorize(["SUPER_ADMIN"]), checkAdminStatus);


router.post("/admin/store", addAdmin);
router.get("/admin/get", getAllAdmins);
router.get("/admin/show/:id", getAdminById);
router.get("/admin-role-permission/get/:id",getAdminWithRoleAndPermissionsById)


export default router;