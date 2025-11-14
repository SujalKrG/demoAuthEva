import express from "express";
import { login, logout } from "../controllers/authController.js";
import {
  changePassword,
  //   resetPasswordWithOTP,
} from "../controllers/changePassword.js";
import authenticate from "../middlewares/authMiddleware.js";
import {resetAdminPasswordBySA} from "../controllers/SApasswordChange.js";

const router = express.Router();

router.post("/login", login);
router.post("/change-password", authenticate, changePassword);
router.post(
  "/reset-admin-password/:adminId",
  authenticate, // must be logged in as super admin
  resetAdminPasswordBySA
);

// router.post("/request-password-otp", requestPasswordOTP);
// router.post("/reset-password", resetPasswordWithOTP);

router.post("/logout", logout);

export default router;
