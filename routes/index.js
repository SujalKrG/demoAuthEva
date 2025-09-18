import express from "express";

import adminRouter from "./superAdmin/adminRouter.js";
import eventRouter from "./superAdmin/eventRouter.js";
import occasionFormFieldRouter from "./superAdmin/occasionFieldRouter.js";
import occasionRouter from "./superAdmin/occasionRouter.js";
import permissionRouter from "./superAdmin/permissionRouter.js"
import permissionToRoleRouter from './superAdmin/permissionToRoleRouter.js'
import roleRouter from "./superAdmin/roleRouter.js";
import roleToAdminRouter from "./superAdmin/roleToAdminRouter.js";
import userRouter from "./superAdmin/userRouter.js";
import adminActivityLogRouter from "./superAdmin/adminActivityLogRouter.js";
import themeRouter from "./superAdmin/themeRouter.js";
import themeCategoryRouter from "./superAdmin/themeCategoryRouter.js";
import guestGroupRouter from "./superAdmin/guestGroupRouter.js";
import guestCategoriesRouter from "./superAdmin/guestCategories.js";


import authenticate from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorizeMiddleware.js";
import checkStatus from "../middlewares/statusMiddleware.js";

const router = express.Router();

// router.use(authenticate, checkStatus,authorize(["SUPER_ADMIN"]));

router.use("/", adminRouter);
router.use("/", eventRouter);
router.use("/", occasionFormFieldRouter);
router.use("/", occasionRouter);
router.use("/", permissionRouter);
router.use("/", permissionToRoleRouter);
router.use("/", roleRouter);
router.use("/", roleToAdminRouter);
router.use("/", userRouter);
router.use("/", adminActivityLogRouter);
router.use("/", themeRouter);
router.use("/", themeCategoryRouter);
router.use("/", guestGroupRouter);
router.use("/", guestCategoriesRouter);

export default router;