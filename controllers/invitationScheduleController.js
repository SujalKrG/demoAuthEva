import { logger } from "../utils/logger.js";
import {
  getSchedulesService,
  getPaymentSummaryService,
  getGuestWithMessagesService,
} from "../services/invitationScheduleService.js";

export const getInvitationScheduleSummary = async (req, res, next) => {
  try {
    const {
      userId,
      page = 1,
      limit = 10,
      search,
      status,
      themeType,
    } = req.query;

    const result = await getSchedulesService(userId, page, limit, {
      search,
      status,
      themeType,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    logger.error(`[getInvitationScheduleSummary] ${err.message}`, {
      name: err.name,
      // stack: err.stack,
      body: req.body,
    });
    // console.error(err);
    next(err);
   
  }
};

export const getInvitationPaymentSummary = async (req, res, next) => {
  try {
    const { scheduleNo } = req.params;
    const data = await getPaymentSummaryService(scheduleNo);

    res.status(200).json({
      success: true,
      message: "Invitation payment summary fetched successfully",
      data,
    });
  } catch (err) {
    logger.error(`[getInvitationPaymentSummary] ${err.message}`, {
      name: err.name,
      // stack: err.stack,
      body: req.body,
    });
    // console.error(err);
    next(err);
    
  }
};

export const getDataFromGuestWithMessageSchedule = async (req, res, next) => {
  try {
    const { scheduleNo } = req.params;
    const data = await getGuestWithMessagesService(scheduleNo);

    res.status(200).json({
      success: true,
      message: "Guest and message schedules fetched successfully",
      total_guests: data.length,
      data,
    });
  } catch (err) {
    logger.error(`[getDataFromGuestWithMessageSchedule] ${err.message}`, {
      name: err.name,
      // stack: err.stack,
      body: req.body,
    });
    // console.error(err);
    next(err);
   
  }
};
