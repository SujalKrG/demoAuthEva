import express from "express";
import { login, logout ,changePassword} from "../controllers/authController.js";
import { requestPasswordOTP,resetPasswordWithOTP } from "../controllers/forgotPassword.js";

const router = express.Router();


router.post("/login", login);
// router.get("/protected", authenticate, (req, res) => {
//   res.json({ message: "This is a protected route", admin: req.admin });
// });

// router.get("/dashboard", authenticate, authorize([2]), (req, res) => {
//   res.json({ message: "This is an admin-only route", admin: req.admin });
// });

router.post("/request-password-otp", requestPasswordOTP);
router.post("/reset-password-otp", resetPasswordWithOTP);


// router.post("/change-password",authenticate,authorize(["SUPER_ADMIN"]),  changePassword);

router.post("/logout", logout);

export default router;
