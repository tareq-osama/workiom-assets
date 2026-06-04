import { Client, Databases, Storage } from 'node-appwrite';

export const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT ?? 'https://appwrite.diginsider.net/v1';
export const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID ?? '6a20b7ce00370d089aa3';
export const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY ?? '';

// These IDs are created by the setup script (scripts/setup-appwrite.ts)
export const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? 'assets-db';
export const APPWRITE_ASSETS_COLLECTION_ID = process.env.APPWRITE_ASSETS_COLLECTION_ID ?? 'assets';
export const APPWRITE_COLLECTIONS_COLLECTION_ID = process.env.APPWRITE_COLLECTIONS_COLLECTION_ID ?? 'collections';
export const APPWRITE_USERS_COLLECTION_ID = process.env.APPWRITE_USERS_COLLECTION_ID ?? 'users';
export const APPWRITE_BUCKET_ID = process.env.APPWRITE_BUCKET_ID ?? 'assets-files';

export function createAdminClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  return {
    databases: new Databases(client),
    storage: new Storage(client),
  };
}

// All files are served through our proxy — hides the backend URL and
// fixes SVG display (same-origin, admin key used server-side).
export function getFileViewUrl(fileId: string): string {
  // fileId is either "r2/{key}" (Cloudflare R2) or a bare Appwrite file ID
  return `/api/file/${fileId}`;
}
