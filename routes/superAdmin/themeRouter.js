import express from "express";
import { createTheme , updateTheme, deleteTheme } from "../../controllers/superAdmin/themeController.js";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/authorizeMiddleware.js";
import checkAdminStatus from "../../middlewares/statusMiddleware.js";

const router = express.Router();

router.use(authenticate, authorize(["SUPER_ADMIN"]), checkAdminStatus);

router.post("/theme/store", createTheme);
router.patch("/theme/update/:id", updateTheme);
router.delete("/theme/delete/:id", deleteTheme);


export default router;