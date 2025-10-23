import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/s3.js";

export const testS3Connection = async () => {
  try {
    const bucketName = process.env.AWS_BUCKET;
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`✅ Connected to S3 successfully. Bucket "${bucketName}" is accessible.`);
  } catch (error) {
    console.error("❌ S3 connection failed:", error.message);
  }
};
