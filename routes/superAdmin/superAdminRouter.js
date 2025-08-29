const express = require("express");
const {
  occasionFieldController,
  getOccasionDetails,
} = require("../../controllers/superAdmin/occasionFieldController.js");
const {
  addAdmin,
  assignPermissionToRole,
  assignRoleToAdmin,
  createPermission,
  createRole,
} = require("../../controllers/superAdmin/adminController.js");
const authenticate = require("../../middlewares/authMiddleware.js");
const authorize = require("../../middlewares/authorizeMiddleware.js");
const checkAdminStatus = require("../../middlewares/statusMiddleware.js");

const router = express.Router();

router.get("/admin-only", authenticate, authorize([2]), (req, res) => {
  res.json({ message: "This is an admin-only route", admin: req.admin });
});

router.post(
  "/occasion-field/store",
  authenticate,
  checkAdminStatus,
  authorize(["SUPER_ADMIN"]),
  occasionFieldController
);
router.post("/admin/store", authenticate, authorize(["SUPER_ADMIN"]), addAdmin);

router.post(
  "/admin-role/store",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  assignRoleToAdmin
);
router.post(
  "/role-permission/store",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  assignPermissionToRole
);
router.post(
  "/role/store",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  createRole
);
router.post(
  "/permission/store",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  createPermission
);
router.get(
  "/occasion-field/get/:id",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  getOccasionDetails
);

module.exports = router;
