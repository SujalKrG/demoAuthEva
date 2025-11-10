import { logger } from "../utils/logger.js";
import AppError from "../utils/AppError.js";
import handleSequelizeError from "../utils/handelSequelizeError.js";

export const errorHandler = (err, req, res, next) => {
  // Normalize error
  if (!(err instanceof Error)) {
    err = new AppError("Unknown error occurred", 500, false);
  }

  // Sequelize specific error handling
  if (err.name?.startsWith("Sequelize")) {
    err = handleSequelizeError(err);
  }

  const statusCode = err.statusCode || 500;

  // 🔥 Always log the real error for developers
  logger.error(`${err.name || "Error"}: ${err.message}`, {
    path: req.originalUrl,
    method: req.method,
  });

  // 🧱 Always send safe response to frontend
  res.status(statusCode).json({
    success: false,
    message: "Internal Server Error",
  });
};
