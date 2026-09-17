/**
 * Adds the optional `backgroundColor` attribute to the assets collection.
 * Usage: node scripts/patch-background-color.mjs
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Client, Databases } from 'node-appwrite';

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

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const db = new Databases(client);

async function main() {
  console.log('\n🎨 Adding assets.backgroundColor attribute\n');
  try {
    await db.createStringAttribute(DB, ASSETS, 'backgroundColor', 32, false, '');
    console.log('  ✓ assets.backgroundColor');
  } catch (err) {
    if (err?.code === 409) console.log('  – assets.backgroundColor already exists');
    else throw err;
  }
  console.log('\n✅ Done!\n');
}

main().catch((err) => {
  console.error('\n❌ Failed:', err);
  process.exit(1);
});
