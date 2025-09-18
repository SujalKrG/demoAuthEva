import { Queue } from "bullmq";
import { redisConfig } from "../config/redis.js";

export const imageUploadQueue = new Queue("imageUploadQueue", {
  connection: redisConfig,
});
export const videoUploadQueue = new Queue("videoUploadQueue", {
  connection: redisConfig,
});

console.log("queue initialized successfully")