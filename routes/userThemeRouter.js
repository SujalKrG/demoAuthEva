import express from "express";
import { getUserThemes } from "../controllers/userThemeController.js";
const router = express.Router();

router.get("/user-theme/get", getUserThemes);

export default router;
