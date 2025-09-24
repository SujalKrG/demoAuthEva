import {
  createThemeCategory,
  updateThemeCategory,
  getAllThemeCategories,
  deleteThemeCategory,
} from "../controllers/themeCategoryController.js";
import express from "express";


const router = express.Router();
// router.use(authenticate, checkStatus);

router.post(
  "/theme-category/store",
 
  createThemeCategory
);
router.patch(
  "/theme-category/update/:id",

  updateThemeCategory
);
router.delete(
  "/theme-category/delete/:id",

  deleteThemeCategory
);
router.get(
  "/theme-category/get",

  getAllThemeCategories
);

export default router;
