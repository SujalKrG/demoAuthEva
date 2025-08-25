const express = require("express");
const { register, login, logout } = require("../controllers/authController.js");
const authenticate = require("../middlewares/authMiddleware.js");
const authorize = require("../middlewares/authorizeMiddleware.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/protected", authenticate, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

router.get("/admin-only", authenticate, authorize([2]), (req, res) => {
  res.json({ message: "This is an admin-only route", user: req.user });
});

router.post("/logout", logout);

module.exports = router;
