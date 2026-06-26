import { ID, Query, Permission, Role } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import {
  createAdminClient,
  APPWRITE_DATABASE_ID,
  APPWRITE_ASSETS_COLLECTION_ID,
  APPWRITE_BUCKET_ID,
  getFileViewUrl,
} from './appwrite';
import { r2Configured, r2Upload } from './r2';
import type { Asset, AssetCategory, AssetFormat, AssetStatus } from '@/types/asset';

interface AppwriteAssetDoc {
  $id: string;
  $createdAt: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  status: string;
  owner: string;
  downloadCount: number;
  deprecationReason?: string;
  svgFileId?: string;
  pngFileId?: string;
  jpgFileId?: string;
  thumbnailFileId?: string;
  formats: string[];
  fileSize: number;
}

function mapDoc(doc: AppwriteAssetDoc): Asset {
  const formats = (doc.formats ?? []) as AssetFormat[];
  const svgUrl = doc.svgFileId ? getFileViewUrl(doc.svgFileId) : undefined;
  const pngUrl = doc.pngFileId ? getFileViewUrl(doc.pngFileId) : undefined;
  const jpgUrl = doc.jpgFileId ? getFileViewUrl(doc.jpgFileId) : undefined;
  const thumbnailUrl = doc.thumbnailFileId ? getFileViewUrl(doc.thumbnailFileId) : undefined;

  const fileUrl = svgUrl ?? pngUrl ?? jpgUrl ?? thumbnailUrl ?? '';
  const fileType = formats[0] ?? '';

  const rawDesc = doc.description ?? '';
  const linkUrl = rawDesc.startsWith('[LINK]') ? rawDesc.slice(6) : undefined;
  const description = linkUrl ? undefined : (rawDesc || undefined);

  return {
    id: doc.$id,
    name: doc.name,
    description,
    category: (doc.category as AssetCategory) || 'Brand Items',
    tags: doc.tags ?? [],
    status: (doc.status as AssetStatus) || 'Draft',
    owner: doc.owner ?? '',
    downloadCount: doc.downloadCount ?? 0,
    deprecationReason: doc.deprecationReason || undefined,
    createdAt: doc.$createdAt,
    linkUrl,
    formats,
    svgFileId: doc.svgFileId || undefined,
    pngFileId: doc.pngFileId || undefined,
    jpgFileId: doc.jpgFileId || undefined,
    thumbnailFileId: doc.thumbnailFileId || undefined,
    svgUrl,
    pngUrl,
    jpgUrl,
    thumbnailUrl,
    fileUrl,
    fileType,
    fileSize: doc.fileSize ?? 0,
  };
}

export interface GetAssetsOptions {
  search?: string;
  category?: string;
  status?: string;
  fileType?: string;
  page?: number;
  limit?: number;
}

export async function getAssets(
  options: GetAssetsOptions = {}
): Promise<{ assets: Asset[]; totalCount: number }> {
  const { databases } = createAdminClient();
  const { search, category, status, fileType, page = 1, limit = 24 } = options;
  const offset = (page - 1) * limit;

  const queries: string[] = [
    Query.limit(limit),
    Query.offset(offset),
    Query.orderDesc('$createdAt'),
  ];

  if (category) queries.push(Query.equal('category', category));
  if (status) queries.push(Query.equal('status', status));
  if (fileType) queries.push(Query.contains('formats', [fileType.toUpperCase()]));
  if (search) queries.push(Query.search('name', search));

  try {
    const result = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_ASSETS_COLLECTION_ID,
      queries
    );
    return {
      assets: result.documents.map((d) => mapDoc(d as unknown as AppwriteAssetDoc)),
      totalCount: result.total,
    };
  } catch {
    // Retry without search if fulltext index not ready
    if (search) {
      const fallbackQueries = queries.filter((q) => !q.includes('"search"'));
      const result = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_ASSETS_COLLECTION_ID,
        fallbackQueries
      );
      return {
        assets: result.documents.map((d) => mapDoc(d as unknown as AppwriteAssetDoc)),
        totalCount: result.total,
      };
    }
    throw new Error('Failed to fetch assets');
  }
}

export async function getAsset(id: string): Promise<Asset | null> {
  const { databases } = createAdminClient();
  try {
    const doc = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_ASSETS_COLLECTION_ID,
      id
    );
    return mapDoc(doc as unknown as AppwriteAssetDoc);
  } catch {
    return null;
  }
}

export async function createAsset(data: {
  name: string;
  description?: string;
  category: string;
  tags?: string[];
  status?: string;
  owner?: string;
  svgFileId?: string;
  pngFileId?: string;
  jpgFileId?: string;
  thumbnailFileId?: string;
  formats?: string[];
  fileSize?: number;
}): Promise<Asset> {
  const { databases } = createAdminClient();

  const formats: string[] = data.formats ? [...data.formats] : [];
  if (data.svgFileId && !formats.includes('SVG')) formats.push('SVG');
  if (data.pngFileId && !formats.includes('PNG')) formats.push('PNG');
  if (data.jpgFileId && !formats.includes('JPG')) formats.push('JPG');

  const doc = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_ASSETS_COLLECTION_ID,
    ID.unique(),
    {
      name: data.name,
      description: data.description ?? '',
      category: data.category,
      tags: data.tags ?? [],
      status: data.status ?? 'Draft',
      owner: data.owner ?? '',
      downloadCount: 0,
      svgFileId: data.svgFileId ?? '',
      pngFileId: data.pngFileId ?? '',
      jpgFileId: data.jpgFileId ?? '',
      thumbnailFileId: data.thumbnailFileId ?? '',
      formats,
      fileSize: data.fileSize ?? 0,
    }
  );

  return mapDoc(doc as unknown as AppwriteAssetDoc);
}

export async function updateAsset(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    category: string;
    tags: string[];
    status: string;
    owner: string;
    downloadCount: number;
    svgFileId: string;
    pngFileId: string;
    jpgFileId: string;
    thumbnailFileId: string;
    formats: string[];
    fileSize: number;
    deprecationReason: string;
  }>
): Promise<Asset | null> {
  const { databases } = createAdminClient();
  try {
    const doc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_ASSETS_COLLECTION_ID,
      id,
      data
    );
    return mapDoc(doc as unknown as AppwriteAssetDoc);
  } catch {
    return null;
  }
}

export async function deleteAsset(id: string): Promise<boolean> {
  const { databases } = createAdminClient();
  try {
    await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_ASSETS_COLLECTION_ID, id);
    return true;
  } catch {
    return false;
  }
}

export async function uploadAssetFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ fileId: string; fileUrl: string }> {
  // Use R2 when configured; fall back to Appwrite Storage otherwise
  if (r2Configured()) {
    const key = `${ID.unique()}/${fileName}`;
    await r2Upload(key, buffer, mimeType || 'application/octet-stream');
    const fileId = `r2/${key}`;
    return { fileId, fileUrl: getFileViewUrl(fileId) };
  }

  const { storage } = createAdminClient();
  const file = await storage.createFile(
    APPWRITE_BUCKET_ID,
    ID.unique(),
    InputFile.fromBuffer(buffer, fileName),
    [Permission.read(Role.any())]
  );
  return { fileId: file.$id, fileUrl: getFileViewUrl(file.$id) };
}

export async function deleteAssetFile(fileId: string): Promise<void> {
  const { storage } = createAdminClient();
  await storage.deleteFile(APPWRITE_BUCKET_ID, fileId);
}
