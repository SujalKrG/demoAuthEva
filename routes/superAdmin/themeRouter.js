import express from "express";
import {
  createTheme,
  updateTheme,
  deleteTheme,
} from "../../controllers/superAdmin/themeController.js";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/authorizeMiddleware.js";
import checkAdminStatus from "../../middlewares/statusMiddleware.js";
import { upload } from "../../middlewares/uploadS3.js";

const router = express.Router();

// router.use(authenticate, authorize(["SUPER_ADMIN"]), checkAdminStatus);

router.post(
  "/theme/store",
  upload.fields([
    { name: "preview_image", maxCount: 1 },
    { name: "preview_video", maxCount: 1 },
  ]),
  createTheme
);
router.patch(
  "/theme/update/:id",
  upload.fields([
    { name: "preview_image", maxCount: 1 },
    { name: "preview_video", maxCount: 1 },
  ]),
  updateTheme
);
router.delete("/theme/delete/:id", deleteTheme);
// router.get("/theme/get", );
// router.get("/theme/show/:id", );

export default router;
