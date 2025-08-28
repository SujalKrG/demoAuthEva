const express = require("express");
const {
  addAdmin,
  assignPermissionToRole,
  assignRoleToAdmin,
  createPermission,
  createRole,
} = require("../controllers/adminController.js");
const authenticate = require("../middlewares/authMiddleware.js");
const authorize = require("../middlewares/authorizeMiddleware.js");
const admin = require("../models/admin.js");
const router = express.Router();

router.get("/admin-only", authenticate, authorize([2]), (req, res) => {
  res.json({ message: "This is an admin-only route", admin: req.admin });
});

router.post("/add", authenticate, authorize(["SUPER_ADMIN"]), addAdmin);
router.post(
  "/assign-role",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  assignRoleToAdmin
);
router.post(
  "/assign-permission",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  assignPermissionToRole
);
router.post(
  "/create-role",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  createRole
);
router.post(
  "/create-permission",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  createPermission
);

module.exports = router;