import  express from"express";
import { login, logout} from "../controllers/authController.js";

import authenticate from"../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorizeMiddleware.js";


const router = express.Router();

router.post("/login", login);
router.get("/protected", authenticate, (req, res) => {
  res.json({ message: "This is a protected route", admin: req.admin });
});

router.get("/dashboard", authenticate, authorize([2]), (req, res) => {
  res.json({ message: "This is an admin-only route", admin: req.admin });
});

router.post("/logout", logout);

export default router;
