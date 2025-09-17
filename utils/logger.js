import winston from "winston";
import path from "path";
import fs, { chownSync } from "fs";

const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),

  transports: [
    new winston.transports.File({ filename: path.join(logDir, "app.log") }),
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});
export default logger;
