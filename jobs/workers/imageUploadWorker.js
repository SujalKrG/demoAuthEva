// jobs/workers/imageUploadWorker.js
import BullMQ from "bullmq";
import db from "../../models/index.js";
import {
  uploadFileToS3,
  sanitizeFileName,
} from "../../middlewares/uploadS3.js";
import dotenv from "dotenv";
dotenv.config();

const { Worker } = BullMQ;

const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
};

export const imageWorker = new Worker(
  "imageUploadQueue",
  async (job) => {
    console.log(`[ImageWorker] Received job: ${job.id}`);

    try {
      const { themeId, file, filename, mimetype } = job.data;
      const buffer = Buffer.from(file, "base64");
      console.log(buffer);
      console.log(`[ImageWorker] Uploading image for themeId=${themeId}...`);
      const imageUrl = await uploadFileToS3(
        buffer,
        "images",
        sanitizeFileName(filename),
        mimetype
      );

      console.log(`[ImageWorker] Image uploaded successfully: ${imageUrl}`);

      await db.Theme.update(
        { preview_image: imageUrl },
        { where: { id: themeId } }
      );

      console.log(
        `[ImageWorker] DB updated with image URL for themeId=${themeId}`
      );
      return { success: true, imageUrl };
    } catch (err) {
      console.error("[ImageWorker] Error:", err);
      throw err;
    }
  },
  { connection: redisConfig, concurrency: 3 }
);

imageWorker.on("completed", (job) => {
  console.log(`[ImageWorker] Job ${job.id} completed successfully`);
});

imageWorker.on("failed", (job, err) => {
  console.error(`[ImageWorker] Job ${job?.id} failed:`, err.message);
});
