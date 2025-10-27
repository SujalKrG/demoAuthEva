import express from "express";
import {createMessageTemplate, getAllMessageTemplates} from "../controllers/messageTemplateController.js"
const router = express.Router();

router.post("/message-template/store",createMessageTemplate);
router.get("/message-template/get",getAllMessageTemplates);

export default router;