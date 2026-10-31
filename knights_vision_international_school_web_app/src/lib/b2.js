// import B2 from "backblaze-b2";

// // Validate environment variables
// const requiredEnvVars = [
//   "BACK_BLAZE_BUCKET_ID",
//   "BACK_BLAZE_BUCKET_KEY_ID",
//   "BACK_BLAZE_BUCKET_APPLICATION_KEY",
//   "BACK_BLAZE_BUCKET_NAME",
// ];

// for (const envVar of requiredEnvVars) {
//   if (!process.env[envVar]) {
//     throw new Error(`Missing required environment variable: ${envVar}`);
//   }
// }

// // Singleton Backblaze B2 client
// let b2Instance;

// if (!b2Instance) {
//   b2Instance = new B2({
//     applicationKeyId: process.env.BACK_BLAZE_BUCKET_KEY_ID,
//     applicationKey: process.env.BACK_BLAZE_BUCKET_APPLICATION_KEY,
//   });
// }

// export default b2Instance;
// export const bucketId = process.env.BACK_BLAZE_BUCKET_ID;
// export const bucketName = process.env.BACK_BLAZE_BUCKET_NAME;
