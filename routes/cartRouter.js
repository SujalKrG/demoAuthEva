import express from "express"
import {getCartSummary} from "../controllers/cartController.js"

const router = express.Router();

router.get("/cart-summary/get",getCartSummary);

export default router;
