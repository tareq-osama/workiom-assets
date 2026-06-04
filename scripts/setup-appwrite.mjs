/**
 * Run once to create the Appwrite database, collections, and storage bucket.
 * Usage: node scripts/setup-appwrite.mjs
 *
 * Reads credentials from .env.local via process.env (set them first or export them).
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Client, Databases, Storage, ID, Permission, Role, DatabasesIndexType as IndexType } from 'node-appwrite';

// Load .env.local manually
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
} catch {
  // .env.local not present — rely on environment variables
}

const ENDPOINT = process.env.APPWRITE_ENDPOINT ?? 'https://appwrite.diginsider.net/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID ?? '6a20b7ce00370d089aa3';
const API_KEY = process.env.APPWRITE_API_KEY ?? '';
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? 'assets-db';
const ASSETS_COL = process.env.APPWRITE_ASSETS_COLLECTION_ID ?? 'assets';
const COLLECTIONS_COL = process.env.APPWRITE_COLLECTIONS_COLLECTION_ID ?? 'collections';
const USERS_COL = process.env.APPWRITE_USERS_COLLECTION_ID ?? 'users';
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID ?? 'assets-files';

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

async function safeCreate(fn, label) {
  try {
    const result = await fn();
    console.log(`  ✓ Created ${label}`);
    return result;
  } catch (err) {
    if (err?.code === 409) {
      console.log(`  – ${label} already exists`);
    } else {
      console.error(`  ✗ Failed to create ${label}:`, err?.message ?? err);
    }
  }
}

async function main() {
  console.log('\n🚀 Appwrite Setup\n');
  console.log(`Endpoint : ${ENDPOINT}`);
  console.log(`Project  : ${PROJECT_ID}`);
  console.log(`Database : ${DATABASE_ID}\n`);

  // Database
  console.log('→ Database');
  await safeCreate(
    () => databases.create(DATABASE_ID, 'Assets Library'),
    'database'
  );

  // ── Assets collection ─────────────────────────────────────────
  console.log('\n→ Assets collection');
  await safeCreate(
    () =>
      databases.createCollection(DATABASE_ID, ASSETS_COL, 'assets', [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]),
    'assets collection'
  );

  const assetAttrs = [
    () => databases.createStringAttribute(DATABASE_ID, ASSETS_COL, 'name', 255, true),
    () => databases.createStringAttribute(DATABASE_ID, ASSETS_COL, 'description', 65535, false, ''),
    () => databases.createStringAttribute(DATABASE_ID, ASSETS_COL, 'category', 100, true),
    () => databases.createStringAttribute(DATABASE_ID, ASSETS_COL, 'status', 50, true, 'Draft'),
    () => databases.createStringAttribute(DATABASE_ID, ASSETS_COL, 'owner', 255, false, ''),
    () => databases.createStringAttribute(DATABASE_ID, ASSETS_COL, 'deprecationReason', 65535, false, ''),
    () => databases.createStringAttribute(DATABASE_ID, ASSETS_COL, 'svgFileId', 255, false, ''),
    () => databases.createStringAttribute(DATABASE_ID, ASSETS_COL, 'pngFileId', 255, false, ''),
    () => databases.createStringAttribute(DATABASE_ID, ASSETS_COL, 'jpgFileId', 255, false, ''),
    () => databases.createStringAttribute(DATABASE_ID, ASSETS_COL, 'thumbnailFileId', 255, false, ''),
    () => databases.createStringAttribute(DATABASE_ID, ASSETS_COL, 'tags', 100, false, null, true),
    () => databases.createStringAttribute(DATABASE_ID, ASSETS_COL, 'formats', 10, false, null, true),
    () => databases.createIntegerAttribute(DATABASE_ID, ASSETS_COL, 'downloadCount', false, 0),
    () => databases.createIntegerAttribute(DATABASE_ID, ASSETS_COL, 'fileSize', false, 0),
  ];

  for (const fn of assetAttrs) {
    const attr = fn.toString().match(/'([^']+)',[^']*'([^']+)'/);
    await safeCreate(fn, `assets.${attr?.[2] ?? '?'}`);
  }

  await safeCreate(
    () =>
      databases.createIndex(DATABASE_ID, ASSETS_COL, 'idx_category', IndexType.Key, ['category']),
    'index assets.category'
  );
  await safeCreate(
    () =>
      databases.createIndex(DATABASE_ID, ASSETS_COL, 'idx_status', IndexType.Key, ['status']),
    'index assets.status'
  );
  await safeCreate(
    () =>
      databases.createIndex(DATABASE_ID, ASSETS_COL, 'idx_name_ft', IndexType.Fulltext, ['name']),
    'fulltext index assets.name'
  );

  // ── Collections collection ────────────────────────────────────
  console.log('\n→ Collections collection');
  await safeCreate(
    () =>
      databases.createCollection(DATABASE_ID, COLLECTIONS_COL, 'collections', [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]),
    'collections collection'
  );

  const collAttrs = [
    () => databases.createStringAttribute(DATABASE_ID, COLLECTIONS_COL, 'name', 255, true),
    () => databases.createStringAttribute(DATABASE_ID, COLLECTIONS_COL, 'description', 65535, false, ''),
    () => databases.createStringAttribute(DATABASE_ID, COLLECTIONS_COL, 'ownerEmail', 255, true),
    () => databases.createStringAttribute(DATABASE_ID, COLLECTIONS_COL, 'ownerName', 255, false, ''),
    () => databases.createStringAttribute(DATABASE_ID, COLLECTIONS_COL, 'visibility', 50, true, 'Private'),
    () => databases.createStringAttribute(DATABASE_ID, COLLECTIONS_COL, 'shareToken', 255, true),
    () => databases.createStringAttribute(DATABASE_ID, COLLECTIONS_COL, 'coverImageUrl', 2048, false, ''),
    () => databases.createStringAttribute(DATABASE_ID, COLLECTIONS_COL, 'assetIds', 255, false, null, true),
  ];

  for (const fn of collAttrs) {
    const attr = fn.toString().match(/'([^']+)',[^']*'([^']+)'/);
    await safeCreate(fn, `collections.${attr?.[2] ?? '?'}`);
  }

  await safeCreate(
    () =>
      databases.createIndex(DATABASE_ID, COLLECTIONS_COL, 'idx_owner', IndexType.Key, ['ownerEmail']),
    'index collections.ownerEmail'
  );
  await safeCreate(
    () =>
      databases.createIndex(DATABASE_ID, COLLECTIONS_COL, 'idx_token', IndexType.Key, ['shareToken']),
    'index collections.shareToken'
  );

  // ── Users collection ──────────────────────────────────────────
  console.log('\n→ Users collection');
  await safeCreate(
    () =>
      databases.createCollection(DATABASE_ID, USERS_COL, 'users', [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]),
    'users collection'
  );

  const userAttrs = [
    () => databases.createStringAttribute(DATABASE_ID, USERS_COL, 'name', 255, true),
    () => databases.createStringAttribute(DATABASE_ID, USERS_COL, 'email', 255, true),
    () => databases.createStringAttribute(DATABASE_ID, USERS_COL, 'passwordHash', 255, true),
    () => databases.createStringAttribute(DATABASE_ID, USERS_COL, 'role', 50, true, 'Viewer'),
    () => databases.createStringAttribute(DATABASE_ID, USERS_COL, 'status', 50, true, 'Pending'),
    () => databases.createStringAttribute(DATABASE_ID, USERS_COL, 'avatarUrl', 2048, false, ''),
    () => databases.createStringAttribute(DATABASE_ID, USERS_COL, 'lastLogin', 50, false, ''),
  ];

  for (const fn of userAttrs) {
    const attr = fn.toString().match(/'([^']+)',[^']*'([^']+)'/);
    await safeCreate(fn, `users.${attr?.[2] ?? '?'}`);
  }

  await safeCreate(
    () =>
      databases.createIndex(DATABASE_ID, USERS_COL, 'idx_email', IndexType.Key, ['email']),
    'index users.email'
  );

  // ── Storage bucket ────────────────────────────────────────────
  console.log('\n→ Storage bucket');
  await safeCreate(
    () =>
      storage.createBucket(BUCKET_ID, 'Assets Files', [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]),
    'assets-files bucket'
  );

  console.log('\n✅ Setup complete!\n');
}

main().catch((err) => {
  console.error('\n❌ Setup failed:', err);
  process.exit(1);
});
