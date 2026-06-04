/**
 * Creates the categories collection in Appwrite and seeds it with the default categories.
 * Run: node scripts/setup-categories.mjs
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Client, Databases, ID, Permission, Role, DatabasesIndexType as IndexType } from 'node-appwrite';

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

const ENDPOINT = process.env.APPWRITE_ENDPOINT ?? 'https://appwrite.diginsider.net/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID ?? '6a20b7ce00370d089aa3';
const API_KEY = process.env.APPWRITE_API_KEY ?? '';
const DB = process.env.APPWRITE_DATABASE_ID ?? 'assets-db';
const COL = process.env.APPWRITE_CATEGORIES_COLLECTION_ID ?? 'categories';

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const db = new Databases(client);

const SEED = [
  { name: 'Brand Items',               icon: 'Star',           color: 'blue',   description: 'Core brand assets including primary marks and identity elements', order: 0 },
  { name: 'Logos',                     icon: 'Layers',         color: 'indigo', description: 'Official logo files in all variants and color modes',              order: 1 },
  { name: 'Client Logos',              icon: 'Building2',      color: 'slate',  description: "Approved logos from clients and partner organizations",             order: 2 },
  { name: 'Brand Icons',               icon: 'Shapes',         color: 'violet', description: 'Icon sets and custom UI icons that follow brand guidelines',        order: 3 },
  { name: 'Brand Illustrations',       icon: 'Pen',            color: 'pink',   description: 'Spot illustrations and decorative graphics in brand style',         order: 4 },
  { name: 'Canva Templates',           icon: 'LayoutTemplate', color: 'teal',   description: 'Ready-to-use Canva templates for social, presentations, and more',  order: 5 },
  { name: 'Ready to Design Brochures', icon: 'BookOpen',       color: 'orange', description: 'Pre-structured brochure layouts ready to populate with content',    order: 6 },
];

async function safe(fn, label) {
  try { const r = await fn(); console.log(`  ✓ ${label}`); return r; }
  catch (e) {
    if (e?.code === 409) console.log(`  – ${label} already exists`);
    else console.error(`  ✗ ${label}: ${e?.message}`);
  }
}

async function waitMs(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('\n📂 Categories Setup\n');

  await safe(() =>
    db.createCollection(DB, COL, 'categories', [
      Permission.read(Role.any()),
      Permission.create(Role.any()),
      Permission.update(Role.any()),
      Permission.delete(Role.any()),
    ]),
    'categories collection'
  );

  const attrs = [
    () => db.createStringAttribute(DB, COL, 'name',        100, true),
    () => db.createStringAttribute(DB, COL, 'icon',         50, false, 'Folder'),
    () => db.createStringAttribute(DB, COL, 'color',        50, false, 'slate'),
    () => db.createStringAttribute(DB, COL, 'description', 500, false, ''),
    () => db.createIntegerAttribute(DB, COL, 'order',           false, 0),
  ];

  for (const fn of attrs) {
    await safe(fn, 'attribute');
  }

  console.log('\nWaiting 5s for attributes to become available...');
  await waitMs(5000);

  await safe(
    () => db.createIndex(DB, COL, 'idx_order', IndexType.Key, ['order']),
    'index categories.order'
  );

  console.log('\nSeeding categories...');
  for (const cat of SEED) {
    await safe(
      () => db.createDocument(DB, COL, ID.unique(), cat),
      `category: ${cat.name}`
    );
  }

  console.log('\n✅ Done!\n');
}

main().catch(e => { console.error(e); process.exit(1); });
