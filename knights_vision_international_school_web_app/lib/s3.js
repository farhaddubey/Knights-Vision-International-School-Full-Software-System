import { S3Client } from "@aws-sdk/client-s3";
import { Agent } from "https";

const storageConfig = {
  keyId: process.env.SSPS_BACK_BLAZE_BUCKET_KEY_ID || process.env.BACK_BLAZE_BUCKET_KEY_ID,
  applicationKey: process.env.SSPS_BACK_BLAZE_BUCKET_APPLICATION_KEY || process.env.BACK_BLAZE_BUCKET_APPLICATION_KEY,
  bucketName: process.env.SSPS_BACK_BLAZE_BUCKET_NAME || process.env.BACK_BLAZE_BUCKET_NAME,
  endpoint: process.env.SSPS_BACK_BLAZE_ENDPOINT || process.env.BACK_BLAZE_ENDPOINT,
};

// Validate environment variables
const requiredEnvVars = [
  "BACK_BLAZE_BUCKET_KEY_ID",
  "BACK_BLAZE_BUCKET_APPLICATION_KEY",
  "BACK_BLAZE_BUCKET_NAME",
  "BACK_BLAZE_ENDPOINT",
];

for (const envVar of requiredEnvVars) {
  const configKey = {
    BACK_BLAZE_BUCKET_KEY_ID: "keyId",
    BACK_BLAZE_BUCKET_APPLICATION_KEY: "applicationKey",
    BACK_BLAZE_BUCKET_NAME: "bucketName",
    BACK_BLAZE_ENDPOINT: "endpoint",
  }[envVar];
  if (!storageConfig[configKey]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Configure Backblaze B2 as S3-compatible
const s3Client = new S3Client({
  endpoint: storageConfig.endpoint,
  region: "us-east-005",
  credentials: {
    accessKeyId: storageConfig.keyId,
    secretAccessKey: storageConfig.applicationKey,
  },
  httpAgent: new Agent({
    keepAlive: true,
    maxSockets: 10,
    keepAliveMsecs: 30000,
  }),
  forcePathStyle: true, // Required for Backblaze B2
});

export default s3Client;
export const bucketName = storageConfig.bucketName;
