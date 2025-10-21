import AppError from "../utils/AppError.js";
import { ZodError } from "zod";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      if (!schema) {
        console.error("Schema is undefined in validateRequest middleware!");
        return next(new AppError("Internal schema error", 500));
      }

      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => e.message).join(", ");
        return next(new AppError(messages, 400));
      }
      return next(new AppError(error.message || "validation error", 400));
    }
  };
};
