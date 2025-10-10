import express from "express";
import { getAllGuestDirectories } from "../controllers/guestDirectoriesController.js";
const router = express.Router();

router.get("/guest-directory/get", getAllGuestDirectories);
export default router;
