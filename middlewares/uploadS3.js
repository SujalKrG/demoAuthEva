import multer from "multer";
import { s3Client } from "../config/s3.js";
import { PutObjectCommand ,DeleteObjectCommand } from "@aws-sdk/client-s3";

const storage = multer.memoryStorage(); // keep files in memory buffer for S3 upload

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit (adjust as needed)
});




// Sanitize file names
export const sanitizeFileName = (filename) => {
  return filename
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "-");
};

// Upload file to S3 and return public URL
export const uploadFileToS3 = async (fileBuffer, folder, originalName, mimetype) => {
  const key = `themes/${folder}/${Date.now()}-${sanitizeFileName(originalName)}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  await s3Client.send(command);

  return `${process.env.AWS_URL}/${key}`;
};

// Delete file from S3
export const deleteFileFromS3 = async (fileUrl) => {
  if (!fileUrl) return;

  const urlParts = fileUrl.split(`${process.env.AWS_URL}/`);
  if (!urlParts[1]) return;

  const key = urlParts[1];

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: key,
  });

  await s3Client.send(command);
};