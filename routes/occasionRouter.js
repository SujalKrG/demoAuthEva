import express from "express";
import { getOccasions, updateOccasion ,getOccasionById} from "../controllers/occasionController.js";

const router = express.Router();

router.get("/get-occasion", getOccasions);
router.patch("/update-occasion/:slug",updateOccasion)
router.get("/get-occasion/:id",getOccasionById)


export default router;
