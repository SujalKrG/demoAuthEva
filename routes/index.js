import express from "express";

import adminRouter from "./adminRouter.js";
import eventRouter from "./eventRouter.js";
import occasionFormFieldRouter from "./occasionFieldRouter.js";
import occasionRouter from "./occasionRouter.js";
import permissionRouter from "./permissionRouter.js"
import permissionToRoleRouter from './permissionToRoleRouter.js'
import roleRouter from "./roleRouter.js";
import roleToAdminRouter from "./roleToAdminRouter.js";
import userRouter from "./userRouter.js";
import adminActivityLogRouter from "./adminActivityLogRouter.js";
import themeRouter from "./themeRouter.js";
import themeCategoryRouter from "./themeCategoryRouter.js";
import guestGroupRouter from "./guestGroupRouter.js";
import guestCategoriesRouter from "./guestDirectoriesRouter.js";
import themeTypeRouter from "./themeTypeRouter.js"
import messageChannelRouter from "./messageChannelRouter.js"
import messagePricing from "./messagePricingRouter.js"
import cartSummary from "./cartRouter.js"
import messageTemplateRouter from "./messageTemplateRouter.js";
import webhookRouter from "./webhookRouter.js";



import authenticate from "../middlewares/authMiddleware.js";
import checkStatus from "../middlewares/statusMiddleware.js";

const router = express.Router();

router.use(authenticate, checkStatus)

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
router.use("/", themeTypeRouter)
router.use("/", messageChannelRouter)
router.use("/", messagePricing)
router.use("/", cartSummary)
router.use("/", messageTemplateRouter)
router.use("/", webhookRouter)

export default router;