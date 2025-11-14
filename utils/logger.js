import winston from "winston";
import path from "path";
import fs from "fs";
import DailyRotateFile from "winston-daily-rotate-file";

const logDir = "logs";
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logFormat = winston.format.printf(
  ({ timestamp, level, message, ...meta }) => {
    // 🧹 Filter meta: keep only strings, numbers, booleans
    const safeMeta = {};
    for (const [key, value] of Object.entries(meta)) {
      if (["string", "number", "boolean"].includes(typeof value)) {
        safeMeta[key] = value;
      }
    }

    return `${timestamp} [${level.toUpperCase()}]: ${message}${
      Object.keys(safeMeta).length ? " " + JSON.stringify(safeMeta) : ""
    }`;
  }
);

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, "app-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
    }),
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
    }),
  ],
});

// 👇 keep console verbose only in dev
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}
