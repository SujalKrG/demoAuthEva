import express from "express";
import { createMessageChannel } from "../controllers/messageChannelController.js";
const router = express.Router();

router.post("/message-channels/store",createMessageChannel);

export default router;
