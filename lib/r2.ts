// Cloudflare R2 via the native CF REST API — no S3 SDK needed.
// Slashes in object keys are sent literally per the R2 API spec.
// All file serves go through /api/file/r2/[...key] (Next.js proxy).

const CF_API = 'https://api.cloudflare.com/client/v4';

function cfg() {
  return {
    token:     process.env.CLOUDFLARE_API_TOKEN ?? '',
    accountId: process.env.R2_ACCOUNT_ID ?? '989f6a7887fd7b0570d1effb5000ce74',
    bucket:    process.env.R2_BUCKET ?? 'workiom-assets',
  };
}

function objectUrl(key: string): string {
  const { accountId, bucket } = cfg();
  return `${CF_API}/accounts/${accountId}/r2/buckets/${bucket}/objects/${key}`;
}

// true once R2 bucket exists and R2_ENABLED=true is set in .env.local
export function r2Configured(): boolean {
  return process.env.R2_ENABLED === 'true' && !!process.env.CLOUDFLARE_API_TOKEN;
}

export async function r2Upload(key: string, body: Buffer, contentType: string): Promise<void> {
  const res = await fetch(objectUrl(key), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${cfg().token}`,
      'Content-Type': contentType,
      'Content-Length': String(body.byteLength),
    },
    body: new Uint8Array(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`R2 upload failed: ${res.status} ${text}`);
  }
}

export async function r2Download(
  key: string
): Promise<{ body: ReadableStream; contentType: string } | null> {
  const res = await fetch(objectUrl(key), {
    headers: { Authorization: `Bearer ${cfg().token}` },
  });
  if (!res.ok) return null;
  return {
    body: res.body!,
    contentType: res.headers.get('content-type') ?? 'application/octet-stream',
  };
}

export async function r2Delete(key: string): Promise<void> {
  await fetch(objectUrl(key), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${cfg().token}` },
  });
}
