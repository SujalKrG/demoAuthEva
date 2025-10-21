import { logger } from "../utils/logger.js";
import AppError from "./AppError.js";

const handleSequelizeError = (error, res) => {
  // Log everything for developers
  logger.error(`[Sequelize Error] ${error.message}`, {
    name: error.name,
    stack: error.stack,
    errors: error.errors || [],
  });

  // Return only safe, minimal responses
  switch (error.name) {
    case "SequelizeValidationError":
      return new AppError("Invalid input data.", 400);

    case "SequelizeUniqueConstraintError":
      return new AppError("Duplicate entry. This record already exists.", 409);

    case "SequelizeForeignKeyConstraintError":
      return new AppError("Invalid reference. Please check related data.", 400);

    case "SequelizeConnectionError":
    case "SequelizeConnectionRefusedError":
    case "SequelizeHostNotFoundError":
    case "SequelizeHostNotReachableError":
    case "SequelizeInvalidConnectionError":
      return new AppError(
        "Service temporarily unavailable. Please try again later.",
        503
      );

    default:
      return new AppError("Internal Server Error", 500);
  }
};

export default handleSequelizeError;
