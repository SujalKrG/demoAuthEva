import express from "express";
import {getAllGuestGroups} from "../controllers/guestGroupController.js"

const router = express.Router();

router.get("/guest-group/get",getAllGuestGroups)


export default router;