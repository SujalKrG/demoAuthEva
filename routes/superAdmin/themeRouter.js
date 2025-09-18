import express from "express";
import {
  createTheme,
  updateTheme,
  updateStatus,
  deleteTheme,
  getAllTheme,
  // getThemeBySlug,
  countryCode,
  
} from "../../controllers/superAdmin/themeController.js";

const router = express.Router();
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

router.post("/theme/store",upload.fields([{ name: "preview_image" }, { name: "preview_video" }]), createTheme);
router.patch("/theme/update/:id",upload.fields([{ name: "preview_image" }, { name: "preview_video" }]), updateTheme);
router.delete("/theme/delete/:id", deleteTheme);
router.get("/theme/get", getAllTheme);
router.get("/country/get", countryCode);
router.post("/theme/update-status/:id", updateStatus);



export default router;
