import express from "express";
import { getAllEvents } from "../../controllers/superAdmin/eventController.js";
import {searchLimiter} from "../../middlewares/rateLimiterMiddleware.js";

const router = express.Router();

router.get("/event/get", getAllEvents);
// router.get("/events/get",searchLimiter, EventFiltration);


export default router;
