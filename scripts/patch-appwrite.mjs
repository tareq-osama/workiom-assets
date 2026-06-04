/**
 * Patch: adds the attributes that failed in setup (required attrs with defaults).
 * In Appwrite 1.8.x, required attributes cannot have default values.
 * We set them as optional with a default instead.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Client, Databases, DatabasesIndexType as IndexType } from 'node-appwrite';

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
const DB = process.env.APPWRITE_DATABASE_ID ?? 'assets-db';
const ASSETS = process.env.APPWRITE_ASSETS_COLLECTION_ID ?? 'assets';
const COLLECTIONS = process.env.APPWRITE_COLLECTIONS_COLLECTION_ID ?? 'collections';
const USERS = process.env.APPWRITE_USERS_COLLECTION_ID ?? 'users';

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const db = new Databases(client);

async function safe(fn, label) {
  try {
    await fn();
    console.log(`  ✓ ${label}`);
  } catch (err) {
    if (err?.code === 409) console.log(`  – ${label} already exists`);
    else console.error(`  ✗ ${label}: ${err?.message ?? err}`);
  }
}

async function waitMs(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('\n🔧 Appwrite Patch\n');

  // Optional (not required) with defaults — works in 1.8.x
  await safe(() => db.createStringAttribute(DB, ASSETS, 'status', 50, false, 'Draft'), 'assets.status');
  await safe(() => db.createStringAttribute(DB, COLLECTIONS, 'visibility', 50, false, 'Private'), 'collections.visibility');
  await safe(() => db.createStringAttribute(DB, USERS, 'role', 50, false, 'Viewer'), 'users.role');
  await safe(() => db.createStringAttribute(DB, USERS, 'status', 50, false, 'Pending'), 'users.status');

  console.log('\nWaiting 5s for Appwrite to process attributes...');
  await waitMs(5000);

  await safe(() => db.createIndex(DB, ASSETS, 'idx_status', IndexType.Key, ['status']), 'index assets.status');
  await safe(() => db.createIndex(DB, USERS, 'idx_user_status', IndexType.Key, ['status']), 'index users.status');

  console.log('\n✅ Patch complete!\n');
}

main().catch(err => { console.error(err); process.exit(1); });
