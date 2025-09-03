import express from "express";
import {
  createOccasionField,
  updateOccasionField,
  deleteOccasionField,
} from "../../controllers/superAdmin/occasionFieldController.js";

import {
  getOccasions,
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
router.use(authenticate, authorize(["SUPER_ADMIN"]), checkAdminStatus);

//! Manage admin routes

router.post("/admin/store", addAdmin);

router.post("/admin-role/store", assignRoleToAdmin);
router.post("/role-permission/store", assignPermissionToRole);
router.post("/role/store", createRole);
router.post("/permission/store", createPermission);

//! Occasion form field routes
/**
 * 1. Create occasion form fields through /occasion-field/store
 * 2. Get all occasion form fields through /occasion-field/get
 * 3. Retrieve occasion form fields through /occasion-field/show/:id
 * 4. Update occasion form fields through /occasion-field/update/:id
 * 5. Delete occasion form fields through /occasion-field/delete/:id
 */
router.post("/occasion-field/store", createOccasionField);
router.get("/occasion-field/get", getAllOccasionFields);
router.get("/occasion-field/show/:id", getOccasionFieldsById);
router.patch("/occasion-field/update/:id", updateOccasionField);
router.delete("/occasion-field/delete/:id", deleteOccasionField);
router.get("/get-occasion", getOccasions);

export default router;
