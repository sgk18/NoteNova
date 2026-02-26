import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.B2_KEY_ID || !process.env.B2_APP_KEY) {
    console.error("❌ CRITICAL: Backblaze B2 credentials not found. If you just added them to .env, you must RESTART YOUR NEXT.JS SERVER.");
}

const b2 = new S3Client({
    endpoint: process.env.B2_ENDPOINT,
    region: process.env.B2_REGION,
    credentials: {
        accessKeyId: process.env.B2_KEY_ID || "missing-key-id",
        secretAccessKey: process.env.B2_APP_KEY || "missing-app-key",
    },
});

export default b2;
