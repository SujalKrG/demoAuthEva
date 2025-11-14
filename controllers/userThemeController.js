import { getUserThemeService } from "../services/userThemeService.js";
import { logger } from "../utils/logger.js";

export const getUserThemes = async (req, res, next) => {
  try {
    const result = await getUserThemeService(req.query);

    return res.status(200).json({
      success: true,
      message: "User themes fetched successfully",
      count: result.count,
      data: result.data,
    });
  } catch (error) {
    logger.error(`[user theme][getAll] ${error.message}`, {
      name: error.name,
      // stack: error.stack,
      body: req.body,
    });
    // console.error(error);
    next(error);
  }
};
