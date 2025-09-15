import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./config/s3.js";

async function checkFileExists(key) {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
      })
    );
    console.log("✅ File exists in S3");
    return true;
  } catch (err) {
    if (err.name === "NotFound") {
      console.log("❌ File not found in S3");
      return false;
    }
    throw err;
  }
}
checkFileExists("20GUDGKWWOLN2+W5cNg67E3q/YUDg25+aIsI2C6j");
