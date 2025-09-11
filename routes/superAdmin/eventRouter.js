import express from "express";
import { getAllEvents,EventFiltration } from "../../controllers/superAdmin/eventController.js";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/authorizeMiddleware.js";
import checkAdminStatus from "../../middlewares/statusMiddleware.js";
import {searchLimiter} from "../../middlewares/rateLimiterMiddleware.js";

const router = express.Router();

router.use(authenticate, authorize(["SUPER_ADMIN"]), checkAdminStatus);

// router.get("/event/get", getAllEvents);
router.get("/get-events",searchLimiter, EventFiltration);


export default router;
