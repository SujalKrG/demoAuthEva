import express from "express";
import {
  createMessageTemplate,
  getAllMessageTemplates,
  changeTemplateStatus,
} from "../controllers/messageTemplateController.js";
const router = express.Router();

router.post("/message-template/store", createMessageTemplate);
router.get("/message-template/get", getAllMessageTemplates);
router.patch("/message-template/update/:id", changeTemplateStatus);

export default router;
