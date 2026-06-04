import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

export const R2_BUCKET = process.env.R2_BUCKET ?? 'workiom-assets';
export const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID ?? '989f6a7887fd7b0570d1effb5000ce74';

// R2 S3-compatible endpoint — credentials come from env vars set after
// enabling R2 in the Cloudflare dashboard and creating an R2 API token.
function r2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    },
  });
}

export function r2Configured(): boolean {
  return !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
}

export async function r2Upload(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  await r2Client().send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function r2Download(key: string): Promise<{ body: ReadableStream; contentType: string } | null> {
  try {
    const res = await r2Client().send(
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: key })
    );
    if (!res.Body) return null;
    return {
      body: res.Body.transformToWebStream(),
      contentType: res.ContentType ?? 'application/octet-stream',
    };
  } catch {
    return null;
  }
}

export async function r2Delete(key: string): Promise<void> {
  await r2Client().send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
