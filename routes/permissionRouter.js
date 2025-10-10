import express from "express";
import {
  createPermission,
  getPermissions,
} from "../controllers/permissionController.js";
import authorizeDynamic from "../middlewares/dynamicAuthorizeMiddleware.js";

const router = express.Router();
router.use(authorizeDynamic());

router.post("/permission/store", createPermission);
router.get("/permission/get", getPermissions);

export default router;
