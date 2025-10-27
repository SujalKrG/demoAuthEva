import express from "express";
const router = express.Router();
import authorizeDynamic from "../middlewares/dynamicAuthorizeMiddleware.js";
import {
  createTheme,
  updateTheme,
  updateStatus,
  getAllTheme,
  countryCode,
} from "../controllers/themeController.js";

import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
router.use(authorizeDynamic());

router.post(
  "/theme/store",
  upload.fields([{ name: "preview_image" }, { name: "preview_video" }]),
  createTheme
);
router.patch(
  "/theme/update/:id",
  upload.fields([{ name: "preview_image" }, { name: "preview_video" }]),
  updateTheme
);

router.get("/theme/get", getAllTheme);
router.get("/country/get", countryCode);
router.patch("/theme/update-status/:id", updateStatus);

export default router;
