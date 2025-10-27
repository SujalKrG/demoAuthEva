import express from "express";
import {getVerificationEndPoint, receiveWebhook}from "../controllers/webhookController.js"
const router = express.Router();

router.get("/webhook", getVerificationEndPoint);
router.post("/webhook", receiveWebhook);
export default router;
