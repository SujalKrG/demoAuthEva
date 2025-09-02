import express from "express";
import {
  occasionFieldController,
  updateOccasionField,
  deleteOccasionField,
} from "../../controllers/superAdmin/occasionFieldController.js";

import {
  occasions,
  getAllOccasionFields,
  getOccasionFieldsById,
} from "../../controllers/superAdmin/occasionController.js";
import {
  addAdmin,
  assignPermissionToRole,
  assignRoleToAdmin,
  createPermission,
  createRole,
} from "../../controllers/superAdmin/adminController.js";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/authorizeMiddleware.js";
import checkAdminStatus from "../../middlewares/statusMiddleware.js";

const router = express.Router();



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
router.get(
  "/occasion-field/get",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  getAllOccasionFields
);

router.get(
  "/occasion-field/show/:id",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  getOccasionFieldsById
);
//-------------------------------------------------------------------------------------------
router.patch(
  "/occasion-field/update/:id",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  updateOccasionField
);

router.delete(
  "/occasion-field/delete/:id",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  deleteOccasionField
);

router.get(
  "/get-occasion",
  authenticate,
  authorize(["SUPER_ADMIN"]),
  occasions
);

export default router;
