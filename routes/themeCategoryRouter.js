import {
  createThemeCategory,
  updateThemeCategory,
  getAllThemeCategories,
  deleteThemeCategory,
} from "../controllers/themeCategoryController.js";
import express from "express";
import authorize from "../middlewares/authorizeMiddleware.js";

const router = express.Router();
// router.use(authenticate, checkStatus);

router.post(
  "/theme-category/store",
  authorize([5]),
  createThemeCategory
);
router.patch(
  "/theme-category/update/:id",
  authorize([6]),
  updateThemeCategory
);
router.delete(
  "/theme-category/delete/:id",
  authorize([7]),
  deleteThemeCategory
);
router.get(
  "/theme-category/get",
  authorize([8]),
  getAllThemeCategories
);

export default router;
