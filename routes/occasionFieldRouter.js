import express from "express";
import {
  createOccasionField,
  getAllOccasionFields,
  getOccasionFieldsById,
  updateOccasionField,
  deleteOccasionField,
} from "../controllers/occasionFieldController.js";

const router = express.Router();

router.post("/occasion-field/store", createOccasionField);
router.get("/occasion-field/get", getAllOccasionFields);
router.get("/occasion-field/show/:id", getOccasionFieldsById);
router.patch("/occasion-field/update/:id", updateOccasionField);
router.delete("/occasion-field/delete/:id", deleteOccasionField);

export default router;
