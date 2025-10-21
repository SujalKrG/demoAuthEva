import dotenv from "dotenv";
import AppError from "../utils/AppError.js";
dotenv.config();


if (!process.env.REDIS_HOST) {
  console.error("❌ Missing REDIS_HOST environment variable!");
  process.exit(1);
}

export const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT||6379,
  // password: process.env.REDIS_PASSWORD||undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy: (times) => {
    if (times > 10) {
      throw new AppError("Redis: Failed to connect after 5 retries!");
    }
    return Math.min(times * 2000, 10000);
  },
};
