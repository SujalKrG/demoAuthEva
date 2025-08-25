const express = require("express");
const {register,login} = require("../controllers/authController.js");
const authenticate = require("../middlewares/authMiddleware.js")

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/protected", authenticate, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});


module.exports = router;
