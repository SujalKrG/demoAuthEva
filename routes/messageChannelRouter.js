import express from "express";
import { createMessageChannel , getAllMessageChannels} from "../controllers/messageChannelController.js";
const router = express.Router();

router.post("/message-channels/store", createMessageChannel);
router.get("/message-channels/get", getAllMessageChannels);

export default router;
