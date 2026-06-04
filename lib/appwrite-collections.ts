import { ID, Query } from 'node-appwrite';
import {
  createAdminClient,
  APPWRITE_DATABASE_ID,
  APPWRITE_COLLECTIONS_COLLECTION_ID,
} from './appwrite';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  assetIds: string[];
  ownerEmail: string;
  ownerName: string;
  visibility: 'Private' | 'Public';
  shareToken: string;
  coverImageUrl?: string;
  createdAt?: string;
}

interface AppwriteCollectionDoc {
  $id: string;
  $createdAt: string;
  name: string;
  description?: string;
  assetIds: string[];
  ownerEmail: string;
  ownerName: string;
  visibility: string;
  shareToken: string;
  coverImageUrl?: string;
}

function mapDoc(doc: AppwriteCollectionDoc): Collection {
  return {
    id: doc.$id,
    name: doc.name,
    description: doc.description || undefined,
    assetIds: doc.assetIds ?? [],
    ownerEmail: doc.ownerEmail ?? '',
    ownerName: doc.ownerName ?? '',
    visibility: (doc.visibility as Collection['visibility']) || 'Private',
    shareToken: doc.shareToken ?? '',
    coverImageUrl: doc.coverImageUrl || undefined,
    createdAt: doc.$createdAt,
  };
}

export async function getCollectionsByOwner(ownerEmail: string): Promise<Collection[]> {
  const { databases } = createAdminClient();
  const result = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTIONS_COLLECTION_ID,
    [Query.equal('ownerEmail', ownerEmail), Query.orderDesc('$createdAt'), Query.limit(100)]
  );
  return result.documents.map((d) => mapDoc(d as unknown as AppwriteCollectionDoc));
}

export async function getCollectionByShareToken(token: string): Promise<Collection | null> {
  const { databases } = createAdminClient();
  try {
    const result = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTIONS_COLLECTION_ID,
      [Query.equal('shareToken', token), Query.limit(1)]
    );
    if (!result.documents.length) return null;
    return mapDoc(result.documents[0] as unknown as AppwriteCollectionDoc);
  } catch {
    return null;
  }
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  const { databases } = createAdminClient();
  try {
    const doc = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTIONS_COLLECTION_ID,
      id
    );
    return mapDoc(doc as unknown as AppwriteCollectionDoc);
  } catch {
    return null;
  }
}

export async function createCollection(data: {
  name: string;
  description?: string;
  ownerEmail: string;
  ownerName: string;
  coverImageUrl?: string;
  visibility?: 'Private' | 'Public';
}): Promise<Collection> {
  const { databases } = createAdminClient();
  const shareToken = crypto.randomUUID();
  const doc = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTIONS_COLLECTION_ID,
    ID.unique(),
    {
      name: data.name,
      description: data.description ?? '',
      assetIds: [],
      ownerEmail: data.ownerEmail,
      ownerName: data.ownerName,
      visibility: data.visibility ?? 'Private',
      shareToken,
      coverImageUrl: data.coverImageUrl ?? '',
    }
  );
  return mapDoc(doc as unknown as AppwriteCollectionDoc);
}

export async function addAssetToCollection(
  collectionId: string,
  assetId: string,
  assetMeta: { thumbnailUrl?: string; fileUrl?: string }
): Promise<Collection> {
  const { databases } = createAdminClient();
  const coll = await getCollectionById(collectionId);
  if (!coll) throw new Error('Collection not found');

  const newIds = Array.from(new Set([...coll.assetIds, assetId]));
  const coverImageUrl = coll.coverImageUrl || assetMeta.thumbnailUrl || assetMeta.fileUrl || '';

  const doc = await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTIONS_COLLECTION_ID,
    collectionId,
    { assetIds: newIds, coverImageUrl }
  );
  return mapDoc(doc as unknown as AppwriteCollectionDoc);
}

export async function removeAssetFromCollection(
  collectionId: string,
  assetId: string
): Promise<Collection> {
  const { databases } = createAdminClient();
  const coll = await getCollectionById(collectionId);
  if (!coll) throw new Error('Collection not found');

  const newIds = coll.assetIds.filter((id) => id !== assetId);
  const doc = await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTIONS_COLLECTION_ID,
    collectionId,
    { assetIds: newIds }
  );
  return mapDoc(doc as unknown as AppwriteCollectionDoc);
}

export async function setCollectionVisibility(
  collectionId: string,
  visibility: 'Private' | 'Public'
): Promise<void> {
  const { databases } = createAdminClient();
  await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTIONS_COLLECTION_ID,
    collectionId,
    { visibility }
  );
}

export async function deleteCollection(collectionId: string): Promise<void> {
  const { databases } = createAdminClient();
  await databases.deleteDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTIONS_COLLECTION_ID,
    collectionId
  );
}
