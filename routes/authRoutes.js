const express = require("express");
const { register, login, logout } = require("../controllers/authController.js");
const {addAdmin,assignPermissionToRole,assignRoleToAdmin} =require("../controllers/adminController.js");
const authenticate = require("../middlewares/authMiddleware.js");
const authorize = require("../middlewares/authorizeMiddleware.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/protected", authenticate, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});



router.post("/logout", logout);

module.exports = router;
