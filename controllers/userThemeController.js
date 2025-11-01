import { getUserThemeService } from "../services/userThemeService.js";
import AppError from "../utils/AppError.js";

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
    console.error("Error fetching user themes:", error);
    next(error instanceof AppError ? error : new AppError("Failed to fetch user themes", 500));
  }
};