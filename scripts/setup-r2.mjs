/**
 * Run AFTER enabling R2 in the Cloudflare Dashboard.
 * Creates the R2 bucket and sets CORS policy, then prints next steps.
 *
 * Usage: node scripts/setup-r2.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

try {
  const lines = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8').split('\n');
  for (const line of lines) {
    const eq = line.indexOf('=');
    if (eq === -1 || line.trim().startsWith('#')) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* rely on env */ }

const TOKEN      = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID ?? '989f6a7887fd7b0570d1effb5000ce74';
const BUCKET     = process.env.R2_BUCKET ?? 'workiom-assets';
const BASE       = 'https://api.cloudflare.com/client/v4';

if (!TOKEN) { console.error('CLOUDFLARE_API_TOKEN not set'); process.exit(1); }

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.json();
}

async function main() {
  console.log('\n☁️  Cloudflare R2 Setup\n');

  // 1. Create bucket
  console.log(`→ Creating bucket "${BUCKET}"...`);
  const bucket = await api('POST', `/accounts/${ACCOUNT_ID}/r2/buckets`, { name: BUCKET });
  if (bucket.success) {
    console.log('  ✓ Bucket created');
  } else if (bucket.errors?.[0]?.code === 10006) {
    console.log('  – Bucket already exists');
  } else {
    console.error('  ✗ Failed:', JSON.stringify(bucket.errors));
    if (bucket.errors?.[0]?.code === 10042) {
      console.error('\n  ❌ R2 is not yet enabled on your account.');
      console.error('  Go to: https://dash.cloudflare.com → R2 → Get started');
      process.exit(1);
    }
  }

  // 2. Set CORS (allows the Next.js app to call /api/file proxy)
  console.log('→ Setting CORS policy...');
  const cors = await api('PUT', `/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET}/cors`, {
    rules: [
      {
        allowed: {
          origins: ['*'],
          methods: ['GET', 'HEAD'],
          headers: ['*'],
        },
        exposeHeaders: ['Content-Type', 'Content-Length', 'ETag'],
        maxAgeSeconds: 86400,
      },
    ],
  });
  if (cors.success) console.log('  ✓ CORS configured');
  else console.log('  – CORS:', JSON.stringify(cors.errors));

  // 3. Patch .env.local to enable R2
  console.log('→ Enabling R2 in .env.local...');
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf-8');
    const updated = content.replace(/^R2_ENABLED=.*$/m, 'R2_ENABLED=true');
    writeFileSync(envPath, updated);
    console.log('  ✓ R2_ENABLED=true written to .env.local');
  } catch (e) {
    console.log('  – Could not patch .env.local:', e.message);
    console.log('  → Manually set R2_ENABLED=true in your .env.local');
  }

  console.log('\n✅ Done! Restart your dev server — new uploads will go to R2.\n');
}

main().catch(e => { console.error(e); process.exit(1); });
