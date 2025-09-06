import express from "express";
import { addAdmin,getAllAdmins } from "../../controllers/superAdmin/adminController.js";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/authorizeMiddleware.js";
import checkAdminStatus from "../../middlewares/statusMiddleware.js";


const router = express.Router();
// router.use(authenticate, authorize(["SUPER_ADMIN"]), checkAdminStatus);


router.post("/admin/store", addAdmin);
router.get("/admin/get", getAllAdmins);


export default router;