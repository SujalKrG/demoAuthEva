import AppError from "../utils/AppError.js";
import Redis from "ioredis";

if (!process.env.REDIS_HOST) {
  console.error("❌ Missing REDIS_HOST environment variable!");
  process.exit(1);
}

export const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT || 6379,
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

let redisClient;

try {
  redisClient = new Redis({
    host: redisConfig.host,
    port: redisConfig.port,
    // password: redisConfig.password, // Uncomment if you use a password
    maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
    enableReadyCheck: redisConfig.enableReadyCheck,
    retryStrategy: redisConfig.retryStrategy,
  });

  redisClient.on("connect", () => {
    console.log("✅ Redis connection established successfully.");
  });

  redisClient.on("error", (err) => {
    console.error("❌ Redis connection error:", err.message);
  });
} catch (error) {
  console.error("❌ Redis initialization failed:", error.message);
  process.exit(1);
}

export { redisClient };
