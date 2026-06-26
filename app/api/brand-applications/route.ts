import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

const CONFIG_KEY = 'brand-applications.json';
const CF_API = 'https://api.cloudflare.com/client/v4';

function objectUrl() {
  const accountId = process.env.R2_ACCOUNT_ID ?? '989f6a7887fd7b0570d1effb5000ce74';
  const bucket = process.env.R2_BUCKET ?? 'workiom-assets';
  return `${CF_API}/accounts/${accountId}/r2/buckets/${bucket}/objects/${CONFIG_KEY}`;
}

async function readConfig() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) return { rows: [] };
  const res = await fetch(objectUrl(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return { rows: [] };
  return res.json();
}

async function writeConfig(config: unknown) {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error('R2 not configured');
  const body = JSON.stringify(config);
  const res = await fetch(objectUrl(), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': String(Buffer.byteLength(body)),
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`R2 write failed: ${res.status} ${text}`);
  }
}

export async function GET() {
  try {
    const config = await readConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ rows: [] });
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get('auth-token')?.value;
  if (!rawToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(rawToken);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const config = await req.json();
  await writeConfig(config);
  return NextResponse.json({ ok: true });
}
