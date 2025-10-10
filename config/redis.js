import dotenv from "dotenv"
dotenv.config();
export const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 10) {
      throw new Error("Redis: Failed to connect after 5 retries!");
    }
    return Math.min(times * 2000, 10000);
  },
  
  // username: process.env.REDIS_USERNAME,
  // password: process.env.REDIS_PASSWORD,
};

