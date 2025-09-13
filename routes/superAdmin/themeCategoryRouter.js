import createThemeCategory from "../../controllers/superAdmin/themeCategoryController.js"
import express from "express";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/authorizeMiddleware.js";
import checkAdminStatus from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticate, authorize(["SUPER_ADMIN"]), checkAdminStatus);

router.post("/theme-category/store", createThemeCategory);

export default router;



