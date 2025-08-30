const express = require("express");
const {
  occasionFieldController,
  getOccasionDetails,
} = require("../../controllers/superAdmin/occasionFieldController.js");

const {
  occasions,
} = require("../../controllers/superAdmin/occasionController.js");
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

// router.get("/admin-only", authenticate, authorize([2]), (req, res) => {
//   res.json({ message: "This is an admin-only route", admin: req.admin });
// });

//! Manage admin routes

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

//! Occasion form field routes
/**
 * 1. Create occasion form fields through /occasion-field/store
 * 2. Get all occasion form fields through /occasion-field/get
 * 3. Retrieve occasion form fields through /occasion-field/show/:id
 * 4. Update occasion form fields through /occasion-field/update/:id
 * 5. Delete occasion form fields through /occasion-field/delete/:id
 */
router.post(
  "/occasion-field/store",
  authenticate,
  checkAdminStatus,
  authorize(["SUPER_ADMIN"]),
  occasionFieldController
);
router.get("/occasion-field/get", authenticate, authorize(["SUPER_ADMIN"]));

router.get(
  "/occasion-field/show/:id",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  getOccasionDetails
);

router.patch(
  "/occasion-field/update/:id",
  authenticate,
  authorize(["SUPER_ADMIN"])
);

router.delete(
  "/occasion-field/delete/:id",
  authenticate,
  authorize(["SUPER_ADMIN"])
);

//! Get occasions from remote DB
router.get(
  "/get-occasion",
  // authenticate,
  // authorize(["SUPER_ADMIN"]),
  occasions
);

//! Occasion field routes

module.exports = router;
