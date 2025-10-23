import { redisClient } from "../config/redis.js";

export const testRedisConnection = async () => {
  try {
    const pong = await redisClient.ping();
    if (pong === "PONG") {
      console.log("✅ Redis ping successful. Connection working fine.");
    } else {
      console.error("⚠️ Redis ping returned unexpected response:", pong);
    }
  } catch (err) {
    console.error("❌ Redis test failed:", err.message);
  }
};
