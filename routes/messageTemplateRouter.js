import express from "express";
import {
  createMessageTemplate,
  getAllMessageTemplates,
  changeTemplateStatus,
  getTemplateById,
} from "../controllers/messageTemplateController.js";
const router = express.Router();

router.post("/message-template/store", createMessageTemplate);
router.get("/message-template/get", getAllMessageTemplates);
router.patch("/message-template/update/:id", changeTemplateStatus);
router.get("/message-template/show/:id", getTemplateById);


export default router;
