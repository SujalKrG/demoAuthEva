import express from "express";
import {getVerificationEndPoint, handleWebhookEvent}from "../controllers/webhookController.js"
const router = express.Router();

router.get("/webhook", getVerificationEndPoint);
router.post("/webhook", handleWebhookEvent);
// router.post("/webhook",handleWebhookEvent)

export default router;
