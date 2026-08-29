import { NextRequest, NextResponse } from "next/server";
import { r2Client } from "@/lib/storage";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

/**
 * Resilient File Streaming & Preview Proxy
 * Fetches private Cloudflare R2 bucket objects server-side using authorized AWS S3 SDK credentials
 * and streams them directly with proper content-type and cache headers.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url") || searchParams.get("key");

  if (!rawUrl) {
    return new NextResponse("Missing file URL or key parameter", { status: 400 });
  }

  // Extract storage key from full R2 URL or relative key
  let storageKey = rawUrl;
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    try {
      const parsed = new URL(rawUrl);
      storageKey = parsed.pathname.replace(/^\/+/, "");
    } catch {
      storageKey = rawUrl;
    }
  }

  try {
    const s3Res = await r2Client.send(
      new GetObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: storageKey,
      })
    );

    if (!s3Res.Body) {
      return new NextResponse("File body not found in storage bucket", { status: 404 });
    }

    const contentType = s3Res.ContentType || (
      storageKey.endsWith(".png") ? "image/png" :
      storageKey.endsWith(".jpg") || storageKey.endsWith(".jpeg") ? "image/jpeg" :
      storageKey.endsWith(".webp") ? "image/webp" :
      storageKey.endsWith(".pdf") ? "application/pdf" :
      "application/octet-stream"
    );

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
    headers.set(
      "Content-Disposition",
      `inline; filename="${storageKey.split("/").pop() || "preview"}"`
    );

    // Transform stream to Web ReadableStream for Next.js response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = s3Res.Body.transformToWebStream ? s3Res.Body.transformToWebStream() : (s3Res.Body as any);

    return new NextResponse(stream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.warn(`[File Preview Proxy] Failed to fetch key "${storageKey}" from Cloudflare R2:`, error);
    return new NextResponse("File preview unavailable from storage.", { status: 404 });
  }
}
