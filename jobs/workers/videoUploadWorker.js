// jobs/workers/videoUploadWorker.js
import BullMQ from "bullmq";
import db from "../../models/index.js";
import { redisConfig } from "../../config/redis.js";
import {
  uploadFileToS3,
  sanitizeFileName,
} from "../../middlewares/uploadS3.js";
import dotenv from "dotenv";
import { redisConfig } from "../../config/redis.js";
dotenv.config();


const { Worker } = BullMQ;



export const videoWorker = new Worker(
  "videoUploadQueue",
  async (job) => {
    console.log(`[VideoWorker] Received job: ${job.id}`);

    try {
      const { themeId, file, filename, mimetype } = job.data;
      const buffer = Buffer.from(file, "base64");
      console.log(`[VideoWorker] Uploading video for themeId=${themeId}...`);
      const videoUrl = await uploadFileToS3(
        buffer,
        "videos",
        sanitizeFileName(filename),
        mimetype
      );

      console.log(`[VideoWorker] Video uploaded successfully: ${videoUrl}`);

      await db.Theme.update(
        { preview_video: videoUrl },
        { where: { id: themeId } }
      );

      console.log(
        `[VideoWorker] DB updated with video URL for themeId=${themeId}`
      );
      return { success: true, videoUrl };
    } catch (err) {
      console.error("[VideoWorker] Error:", err);
      throw err;
    }
  },
  { connection: redisConfig, concurrency: 2 }
);

videoWorker.on("completed", (job) => {
  console.log(`[VideoWorker] Job ${job.id} completed successfully`);
});

videoWorker.on("failed", (job, err) => {
  console.error(`[VideoWorker] Job ${job?.id} failed:`, err.message);
});
