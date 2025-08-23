const express = require("express");
const authController = require("../controllers/authController.js");

const router = express.Router();

router.post("/register");
router.post("/login");

module.exports = router;
