import express from "express";
import {
  createThemeType,
  getAllThemeTypes,
  deleteThemeType,
  updateThemeType,
  getThemeTypeByCategory,
} from "../controllers/themeTypeController.js";

const router = express.Router();

router.post("/theme-type/store", createThemeType);
router.get("/theme-type/get", getAllThemeTypes);
router.delete("/theme-type/delete/:id", deleteThemeType);
router.patch("/theme-type/update/:id", updateThemeType);
router.get("/theme-type/get/:category_id", getThemeTypeByCategory);

export default router;
