import express from "express";
import { getAllUsers ,getUserWithEvents,UserSearch} from "../../controllers/superAdmin/userController.js";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/authorizeMiddleware.js";
import checkAdminStatus from "../../middlewares/statusMiddleware.js";
import { searchLimiter } from "../../middlewares/rateLimiterMiddleware.js";
const router = express.Router();

router.use(authenticate, authorize(["SUPER_ADMIN"]), checkAdminStatus);

router.get("/user/get", getAllUsers);
router.get("/user-with-event/get", getUserWithEvents);
router.get("/user/search",searchLimiter, UserSearch);



export default router;
