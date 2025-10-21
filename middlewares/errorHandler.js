import { logger } from "../utils/logger.js";
import AppError from "../utils/AppError.js";
import handleSequelizeError from "../utils/handelSequelizeError.js";

export const errorHandler = (err, req, res, next) => {
  if (!(err instanceof Error)) {
    err = new AppError("Unknown error occurred", 500);
  }

  if (err.name?.startsWith("Sequelize")) {
    err = handleSequelizeError(err);
  }
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  logger.error(`Error: ${err.message}`, {
    type: "APPLICATION_ERROR",
    stack: err.stack,
    code: err.code,
    sql: err.sql,
    table: err.table,
    path: req.originalUrl,
    method: req.method,
    body: req.body,
  });

  const response = {
    success: false,
    message: isOperational ? err.message : "Internal Server Error",
  };
  res.status(statusCode).json(response);
};
