import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}

let cachedS3Client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (cachedS3Client) return cachedS3Client;
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;

  cachedS3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
  return cachedS3Client;
}

export async function createR2UploadUrl(fileName: string, folder: string, contentType?: string) {
  const s3 = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME || "easypadhai-media";
  const publicBaseUrl = (process.env.R2_PUBLIC_URL || process.env.VITE_R2_PUBLIC_URL || "").replace(/\/+$/, "");

  const ext = fileName.includes(".") ? fileName.split(".").pop() : "bin";
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType || "application/octet-stream",
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  const publicUrl = publicBaseUrl ? `${publicBaseUrl}/${key}` : key;

  return {
    provider: "r2" as const,
    key,
    uploadUrl,
    publicUrl,
    storageRef: `r2://${key}`,
  };
}

export function resolveR2Url(ref: string): string {
  const publicBaseUrl = (process.env.R2_PUBLIC_URL || process.env.VITE_R2_PUBLIC_URL || "").replace(/\/+$/, "");
  if (ref.startsWith("r2://")) {
    const key = ref.slice("r2://".length);
    return `${publicBaseUrl}/${key}`;
  }
  return ref;
}
