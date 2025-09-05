import express from "express";
import {
  createOccasionField,
  getAllOccasionFields,
  getOccasionFieldsById,
  updateOccasionField,
  deleteOccasionField,
} from "../../controllers/superAdmin/occasionFieldController.js";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/authorizeMiddleware.js";
import checkAdminStatus from "../../middlewares/statusMiddleware.js";

const router = express.Router();

router.use(authenticate, authorize(["SUPER_ADMIN"]), checkAdminStatus);

router.post("/occasion-field/store", createOccasionField);
router.get("/occasion-field/get", getAllOccasionFields);
router.get("/occasion-field/show/:id", getOccasionFieldsById);
router.patch("/occasion-field/update/:id", updateOccasionField);
router.delete("/occasion-field/delete/:id", deleteOccasionField);

export default router;
