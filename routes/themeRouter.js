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
import authorize from "../middlewares/authorizeMiddleware.js";

router.post(
  "/theme/store",
  upload.fields([{ name: "preview_image" }, { name: "preview_video" }]),authorize([2]),
  createTheme
);
router.patch(
  "/theme/update/:id",
  upload.fields([{ name: "preview_image" }, { name: "preview_video" }]),authorize([2]),
  updateTheme
);
router.delete("/theme/delete/:id",authorize([3]), deleteTheme);
router.get("/theme/get",authorize([10]), getAllTheme);
router.get("/country/get", countryCode);
router.patch("/theme/update-status/:id",authorize([5]), updateStatus);

export default router;
