/**
 * One-off migration: moves the three hardcoded marketing videos that used to
 * live on the brand-guidelines page into the asset library as real Video
 * assets under a "Marketing Video" category.
 *
 * Renders a placeholder thumbnail (gradient + play button, matching the old
 * section's look) per language with a local headless Chromium via puppeteer,
 * uploads it to Appwrite Storage, and creates one link-style asset per video
 * pointing at its existing Google Drive sharing URL.
 *
 * Usage: node scripts/migrate-marketing-videos.mjs
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Client, Databases, Storage, ID, Query, Permission, Role } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import puppeteer from 'puppeteer';

try {
  const envPath = resolve(process.cwd(), '.env.local');
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* rely on env */ }

const ENDPOINT = process.env.APPWRITE_ENDPOINT ?? 'https://appwrite.diginsider.net/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID ?? '6a20b7ce00370d089aa3';
const API_KEY = process.env.APPWRITE_API_KEY ?? '';
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? 'assets-db';
const ASSETS_COL = process.env.APPWRITE_ASSETS_COLLECTION_ID ?? 'assets';
const CATEGORIES_COL = process.env.APPWRITE_CATEGORIES_COLLECTION_ID ?? 'categories';
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID ?? 'assets-files';
const CATEGORY_NAME = 'Marketing Video';

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);
const storage = new Storage(client);

const VIDEOS = [
  {
    name: 'Marketing Video — English',
    flag: '🇬🇧',
    label: 'English',
    url: 'https://drive.google.com/file/d/1dhnsW6sEIVUAyiNijcYGfyfckl1HkP8i/view?usp=sharing',
  },
  {
    name: 'Marketing Video — Turkish',
    flag: '🇹🇷',
    label: 'Turkish',
    url: 'https://drive.google.com/file/d/1skf1sQdQcoBw02HsAs0RLigBEMxe_8Zp/view?usp=sharing',
  },
  {
    name: 'Marketing Video — Arabic (SA)',
    flag: '🇸🇦',
    label: 'Arabic (SA)',
    url: 'https://drive.google.com/file/d/1C8oEp_KRGDJmtfCJz9JWMOVfbP8p61wj/view?usp=sharing',
  },
];

function thumbnailHtml(flag, label) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1280px; height: 720px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #2E1B69 0%, #4B2A91 55%, #160D3A 100%);
    font-family: -apple-system, 'Segoe UI', sans-serif;
    position: relative;
  }
  .play {
    width: 140px; height: 140px; border-radius: 50%;
    background: #ffffff; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 20px 50px rgba(0,0,0,0.35);
  }
  .play svg { margin-left: 8px; }
  .label {
    position: absolute; left: 56px; bottom: 48px;
    display: flex; align-items: center; gap: 16px;
    color: white; font-size: 40px; font-weight: 600;
  }
  .flag { font-size: 56px; }
</style></head>
<body>
  <div class="play">
    <svg width="56" height="56" viewBox="0 0 24 24" fill="#372078"><path d="M8 5v14l11-7z"/></svg>
  </div>
  <div class="label"><span class="flag">${flag}</span><span>${label}</span></div>
</body></html>`;
}

async function ensureCategory() {
  const result = await databases.listDocuments(DATABASE_ID, CATEGORIES_COL, [Query.limit(100)]);
  const existing = result.documents.find(
    (d) => d.name.toLowerCase() === CATEGORY_NAME.toLowerCase()
  );
  if (existing) {
    console.log(`  – Category "${CATEGORY_NAME}" already exists`);
    return existing.$id;
  }
  const doc = await databases.createDocument(DATABASE_ID, CATEGORIES_COL, ID.unique(), {
    name: CATEGORY_NAME,
    icon: 'Video',
    color: 'rose',
    description: 'Official Workiom marketing videos, per language.',
    order: result.total,
  });
  console.log(`  ✓ Created category "${CATEGORY_NAME}"`);
  return doc.$id;
}

async function assetAlreadyMigrated(name) {
  const result = await databases.listDocuments(DATABASE_ID, ASSETS_COL, [
    Query.equal('name', name),
    Query.limit(1),
  ]);
  return result.total > 0;
}

async function uploadThumbnail(browser, flag, label) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.setContent(thumbnailHtml(flag, label));
  const buffer = await page.screenshot({ type: 'png' });
  await page.close();

  const file = await storage.createFile(
    BUCKET_ID,
    ID.unique(),
    InputFile.fromBuffer(Buffer.from(buffer), `marketing-video-${label.toLowerCase().replace(/[^a-z]+/g, '-')}.png`),
    [Permission.read(Role.any())]
  );
  return file.$id;
}

async function main() {
  console.log('\n🎬 Migrating marketing videos into the asset library\n');

  await ensureCategory();

  const browser = await puppeteer.launch({ headless: true });
  try {
    for (const video of VIDEOS) {
      if (await assetAlreadyMigrated(video.name)) {
        console.log(`  – "${video.name}" already migrated, skipping`);
        continue;
      }

      const thumbnailFileId = await uploadThumbnail(browser, video.flag, video.label);

      await databases.createDocument(DATABASE_ID, ASSETS_COL, ID.unique(), {
        name: video.name,
        description: `[LINK]${video.url}`,
        category: CATEGORY_NAME,
        tags: ['marketing-video'],
        status: 'Active',
        owner: '',
        downloadCount: 0,
        svgFileId: '',
        pngFileId: '',
        jpgFileId: '',
        thumbnailFileId,
        formats: ['MP4'],
        fileSize: 0,
      });
      console.log(`  ✓ Created asset "${video.name}"`);
    }
  } finally {
    await browser.close();
  }

  console.log('\n✅ Migration complete!\n');
}

main().catch((err) => {
  console.error('\n❌ Migration failed:', err);
  process.exit(1);
});
