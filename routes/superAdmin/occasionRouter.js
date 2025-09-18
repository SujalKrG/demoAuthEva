import express from "express";
import { getOccasions } from "../../controllers/superAdmin/occasionController.js";

const router = express.Router();

router.get("/get-occasion", getOccasions);

export default router;
