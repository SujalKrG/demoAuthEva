import { PutObjectCommand , DeleteObjectCommand} from "@aws-sdk/client-s3";
import { s3Client } from "../config/s3.js";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();

export const uploadFileToS3 = async (buffer, folder, filename, mimetype) => {
  const key = `${folder}/${Date.now()}-${filename}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );

  return `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};



export const deleteFileFromS3 = async (fileUrl) => {
   try {
    if (!fileUrl) throw new Error("No file URL provided");

    // Example URL:
    // https://my-bucket.s3.ap-south-1.amazonaws.com/videos/12345-file.mp4

    // Extract Key after the domain
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // removes leading "/"

    console.log(`[deleteFileFromS3] Deleting from S3: Key=${key}`);

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
      })
    );

    console.log("[deleteFileFromS3] File deleted successfully");
    return true;
  } catch (error) {
    console.error("[deleteFileFromS3] Error deleting file:", error);
    return false;
  }
}
export const sanitizeFileName = (filename) => {
  return filename.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
};

export const upload = () => {
  multer({ storage: multer.memoryStorage() });
};
