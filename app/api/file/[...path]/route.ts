import { NextRequest } from 'next/server';
import { r2Download, r2Configured } from '@/lib/r2';
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  APPWRITE_BUCKET_ID,
} from '@/lib/appwrite';

// File IDs are stored as either:
//   "r2/{objectKey}"   → fetch from Cloudflare R2
//   "{appwriteFileId}" → fetch from Appwrite Storage (legacy / fallback)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const raw = path.join('/');

  if (!raw) {
    return new Response('Not found', { status: 404 });
  }

  // ── R2 path ──────────────────────────────────────────────────────────────
  if (raw.startsWith('r2/')) {
    const key = raw.slice(3);

    if (!r2Configured()) {
      return new Response('R2 not configured', { status: 503 });
    }

    const file = await r2Download(key);
    if (!file) {
      return new Response('Not found', { status: 404 });
    }

    return new Response(file.body, {
      headers: {
        'Content-Type': file.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  // ── Appwrite path (legacy) ────────────────────────────────────────────────
  const fileId = raw;
  const appwriteUrl =
    `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${fileId}/view` +
    `?project=${APPWRITE_PROJECT_ID}`;

  const res = await fetch(appwriteUrl, {
    headers: {
      'X-Appwrite-Project': APPWRITE_PROJECT_ID,
      'X-Appwrite-Key': APPWRITE_API_KEY, // admin key — bypasses file-level permissions
    },
  });

  if (!res.ok) {
    return new Response('Not found', { status: res.status });
  }

  const contentType = res.headers.get('content-type') ?? 'application/octet-stream';

  return new Response(res.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
