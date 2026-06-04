import { ID, Query } from 'node-appwrite';
import {
  createAdminClient,
  APPWRITE_DATABASE_ID,
} from './appwrite';

export const APPWRITE_CATEGORIES_COLLECTION_ID =
  process.env.APPWRITE_CATEGORIES_COLLECTION_ID ?? 'categories';

export interface Category {
  id: string;
  name: string;
  icon: string;   // Lucide icon name, e.g. "Star"
  color: string;  // base colour key, e.g. "blue"
  description: string;
  order: number;
}

interface AppwriteCategoryDoc {
  $id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  order: number;
}

function mapDoc(doc: AppwriteCategoryDoc): Category {
  return {
    id: doc.$id,
    name: doc.name,
    icon: doc.icon ?? 'Folder',
    color: doc.color ?? 'slate',
    description: doc.description ?? '',
    order: doc.order ?? 0,
  };
}

export async function getCategories(): Promise<Category[]> {
  const { databases } = createAdminClient();
  try {
    const result = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_CATEGORIES_COLLECTION_ID,
      [Query.orderAsc('order'), Query.limit(100)]
    );
    return result.documents.map((d) => mapDoc(d as unknown as AppwriteCategoryDoc));
  } catch {
    return [];
  }
}

export async function createCategory(data: Omit<Category, 'id'>): Promise<Category> {
  const { databases } = createAdminClient();
  const doc = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_CATEGORIES_COLLECTION_ID,
    ID.unique(),
    {
      name: data.name,
      icon: data.icon,
      color: data.color,
      description: data.description ?? '',
      order: data.order ?? 0,
    }
  );
  return mapDoc(doc as unknown as AppwriteCategoryDoc);
}

export async function updateCategory(id: string, data: Partial<Omit<Category, 'id'>>): Promise<Category> {
  const { databases } = createAdminClient();
  const doc = await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_CATEGORIES_COLLECTION_ID,
    id,
    data
  );
  return mapDoc(doc as unknown as AppwriteCategoryDoc);
}

export async function deleteCategory(id: string): Promise<void> {
  const { databases } = createAdminClient();
  await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_CATEGORIES_COLLECTION_ID, id);
}
