import express from "express";
import {
  createTheme,
  updateTheme,
  deleteTheme,
  getAllTheme,
  // getThemeBySlug,
  countryCode,
} from "../../controllers/superAdmin/themeController.js";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/authorizeMiddleware.js";
import checkAdminStatus from "../../middlewares/statusMiddleware.js";
// import upload from "../../middlewares/uploadS3.js";

const router = express.Router();
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

// router.use(authenticate, authorize(["SUPER_ADMIN"]), checkAdminStatus);

router.post("/theme/store",upload.fields([{ name: "preview_image" }, { name: "preview_video" }]), createTheme);
router.patch("/theme/update/:id",upload.fields([{ name: "preview_image" }, { name: "preview_video" }]), updateTheme);
router.delete("/theme/delete/:id", deleteTheme);
router.get("/theme/get", getAllTheme);
// router.get("/theme/show/:slug", getThemeBySlug);
router.get("/country/get", countryCode);


export default router;
