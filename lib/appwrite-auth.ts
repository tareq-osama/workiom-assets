import { Client, Users, Account, ID, Query } from 'node-appwrite';
import type { User, UserRole, UserStatus } from '@/types/user';

// Appwrite native-auth user shape (admin Users API)
interface AppwriteNativeUser {
  $id: string;
  name: string;
  email: string;
  status: boolean; // true = active, false = blocked
  prefs: { role?: string; status?: string; lastLogin?: string };
}

function adminClient() {
  return new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT ?? 'https://appwrite.diginsider.net/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID ?? '6a20b7ce00370d089aa3')
    .setKey(process.env.APPWRITE_API_KEY ?? '');
}

function mapUser(u: AppwriteNativeUser): User {
  return {
    id: u.$id,
    name: u.name,
    email: u.email,
    role: (u.prefs?.role as UserRole) || 'Viewer',
    status: (u.prefs?.status as UserStatus) || 'Active',
    lastLogin: u.prefs?.lastLogin,
    avatarUrl: undefined,
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = new Users(adminClient());
  try {
    const result = await users.list([Query.equal('email', email.toLowerCase())]);
    if (!result.users.length) return null;
    return mapUser(result.users[0] as unknown as AppwriteNativeUser);
  } catch {
    return null;
  }
}

export async function findUserById(id: string): Promise<User | null> {
  const users = new Users(adminClient());
  try {
    const u = await users.get(id);
    return mapUser(u as unknown as AppwriteNativeUser);
  } catch {
    return null;
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}): Promise<User> {
  const users = new Users(adminClient());

  // Appwrite hashes the password natively
  const u = await users.create(
    ID.unique(),
    data.email.toLowerCase(),
    undefined, // phone
    data.password,
    data.name
  );

  // Store role + status in prefs (Appwrite Auth doesn't have role fields)
  await users.updatePrefs(u.$id, { role: data.role, status: data.status });

  return mapUser({
    ...(u as unknown as AppwriteNativeUser),
    prefs: { role: data.role, status: data.status },
  });
}

// Creates a temporary Appwrite session to verify credentials, then deletes it.
// Returns the Appwrite userId on success, null on failure.
export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<string | null> {
  // No API key — behaves as a regular client so session creation works
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT ?? 'https://appwrite.diginsider.net/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID ?? '6a20b7ce00370d089aa3');

  const account = new Account(client);

  try {
    const session = await account.createEmailPasswordSession(email, password);

    // Immediately clean up the session; we use our own JWT
    new Users(adminClient())
      .deleteSession(session.userId, session.$id)
      .catch(() => {});

    return session.userId;
  } catch {
    return null;
  }
}

export async function updateUserLastLogin(id: string): Promise<void> {
  const users = new Users(adminClient());
  try {
    const u = await users.get(id);
    const prefs = (u as unknown as AppwriteNativeUser).prefs ?? {};
    await users.updatePrefs(id, { ...prefs, lastLogin: new Date().toISOString() });
  } catch { /* fire and forget */ }
}
