import { ID, Query } from 'node-appwrite';
import {
  createAdminClient,
  APPWRITE_DATABASE_ID,
  APPWRITE_USERS_COLLECTION_ID,
} from './appwrite';
import type { User, UserRole, UserStatus } from '@/types/user';

interface AppwriteUserDoc {
  $id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  status: string;
  avatarUrl?: string;
  lastLogin?: string;
}

function mapDoc(doc: AppwriteUserDoc): User {
  return {
    id: doc.$id,
    name: doc.name,
    email: doc.email,
    role: (doc.role as UserRole) || 'Viewer',
    status: (doc.status as UserStatus) || 'Pending',
    avatarUrl: doc.avatarUrl || undefined,
    lastLogin: doc.lastLogin || undefined,
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const raw = await findRawUserByEmail(email);
  return raw ? mapDoc(raw) : null;
}

export async function findRawUserByEmail(
  email: string
): Promise<(AppwriteUserDoc & { passwordHash: string }) | null> {
  const { databases } = createAdminClient();
  try {
    const result = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      [Query.equal('email', email.toLowerCase()), Query.limit(1)]
    );
    if (!result.documents.length) return null;
    return result.documents[0] as unknown as AppwriteUserDoc & { passwordHash: string };
  } catch {
    return null;
  }
}

export async function findUserById(id: string): Promise<User | null> {
  const { databases } = createAdminClient();
  try {
    const doc = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      id
    );
    return mapDoc(doc as unknown as AppwriteUserDoc);
  } catch {
    return null;
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
}): Promise<User> {
  const { databases } = createAdminClient();
  const doc = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_USERS_COLLECTION_ID,
    ID.unique(),
    {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role,
      status: data.status,
      avatarUrl: '',
    }
  );
  return mapDoc(doc as unknown as AppwriteUserDoc);
}

export async function updateUserLastLogin(id: string): Promise<void> {
  const { databases } = createAdminClient();
  await databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_USERS_COLLECTION_ID, id, {
    lastLogin: new Date().toISOString(),
  });
}
