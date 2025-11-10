import express from "express";
import { getInvitationScheduleSummary ,getInvitationPaymentSummary, getDataFromGuestWithMessageSchedule} from "../controllers/invitationScheduleController.js";

const router = express.Router();

// GET /api/admin/users/:userId/details
router.get("/get-schedule", getInvitationScheduleSummary);
// router.get("/get-schedule/:userId", getInvitationScheduleSummary);
router.get("/get-payment-summary/:scheduleNo", getInvitationPaymentSummary);
router.get("/get-guest-message-schedule/:scheduleNo", getDataFromGuestWithMessageSchedule);


export default router;
