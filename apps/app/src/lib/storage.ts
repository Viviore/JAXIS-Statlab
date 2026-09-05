import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

// Cloudflare R2 via S3-compatible API — for large files
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export async function getR2UploadUrl(key: string, contentType: string): Promise<string> {
  return getSignedUrl(
    r2Client,
    new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key, ContentType: contentType }),
    { expiresIn: 300 } // 5 minutes
  );
}

export async function getR2DownloadUrl(key: string): Promise<string> {
  return getSignedUrl(
    r2Client,
    new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }),
    { expiresIn: 3600 } // 1 hour
  );
}

/**
 * Permanently deletes an object from Cloudflare R2 storage bucket.
 */
export async function deleteR2Object(key: string): Promise<boolean> {
  if (!key || !env.R2_BUCKET_NAME) return false;
  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    console.error(`[deleteR2Object] Failed to delete object ${key} from R2:`, error);
    return false;
  }
}

/**
 * Batched deletion for multiple R2 objects with error resilience.
 */
export async function deleteMultipleR2Objects(
  keys: string[]
): Promise<{ deleted: number; failed: number }> {
  let deleted = 0;
  let failed = 0;

  for (const key of keys) {
    if (!key) continue;
    const ok = await deleteR2Object(key);
    if (ok) {
      deleted++;
    } else {
      failed++;
    }
  }

  return { deleted, failed };
}

