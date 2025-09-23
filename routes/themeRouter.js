import express from "express";
const router = express.Router();
import {
  createTheme,
    updateTheme,
    updateStatus,
    deleteTheme,
    getAllTheme,
    // getThemeBySlug,
    countryCode,
} from "../controllers/themeController.js";
// import { upload } from "../utils/requiredMethods.js";

import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/theme/store",
  upload.fields([{ name: "preview_image" }, { name: "preview_video" }]),
  createTheme
);
router.patch("/theme/update/:id",upload.fields([{ name: "preview_image" }, { name: "preview_video" }]), updateTheme);
router.delete("/theme/delete/:id", deleteTheme);
router.get("/theme/get", getAllTheme);
router.get("/country/get", countryCode);
router.patch("/theme/update-status/:id", updateStatus);

export default router;
