export default class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational; // Helps to differentiate expected vs. unexpected errors
    Error.captureStackTrace(this, this.constructor);
  }
}
