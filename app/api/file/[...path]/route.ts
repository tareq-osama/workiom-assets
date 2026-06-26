import { NextRequest } from 'next/server';
import { r2Download, r2Configured } from '@/lib/r2';
import { APPWRITE_BUCKET_ID } from '@/lib/appwrite';

const MIME_BY_EXT: Record<string, string> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

function mimeFromKey(key: string): string | null {
  const ext = key.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXT[ext] ?? null;
}

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

    // Always use extension-based MIME for known image types — stored MIME may be
    // wrong (text/xml, application/xml, empty, etc.) depending on upload source.
    const contentType = mimeFromKey(key) ?? file.contentType;

    return new Response(file.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  // ── Appwrite path (legacy) ────────────────────────────────────────────────
  const fileId = raw;
  const endpoint = process.env.APPWRITE_ENDPOINT ?? 'https://appwrite.diginsider.net/v1';
  const projectId = process.env.APPWRITE_PROJECT_ID ?? '6a20b7ce00370d089aa3';
  const apiKey = process.env.APPWRITE_API_KEY ?? '';

  const appwriteUrl =
    `${endpoint}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${fileId}/view` +
    `?project=${projectId}`;

  const res = await fetch(appwriteUrl, {
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': apiKey, // admin key — bypasses file-level permissions
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
