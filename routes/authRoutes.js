const express = require("express");
const { login, logout} = require("../controllers/authController.js");

const authenticate = require("../middlewares/authMiddleware.js");
const authorize = require("../middlewares/authorizeMiddleware.js");


const router = express.Router();

router.post("/login", login);
router.get("/protected", authenticate, (req, res) => {
  res.json({ message: "This is a protected route", admin: req.admin });
});

router.get("/dashboard", authenticate, authorize([2]), (req, res) => {
  res.json({ message: "This is an admin-only route", admin: req.admin });
});

router.post("/logout", logout);

module.exports = router;
