import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { workiomCollections } from '@/lib/workiom-collections';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!workiomCollections.configured) {
    return NextResponse.json({ collections: [], configured: false });
  }

  try {
    const collections = await workiomCollections.getByOwner(user.email);
    return NextResponse.json({ collections, configured: true });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!workiomCollections.configured) {
    return NextResponse.json({ error: 'Collections not configured' }, { status: 503 });
  }

  try {
    const { name, description, coverImageUrl, visibility } = await request.json() as {
      name?: string;
      description?: string;
      coverImageUrl?: string;
      visibility?: 'Private' | 'Public';
    };
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const collection = await workiomCollections.create({
      name: name.trim(),
      description: description?.trim(),
      coverImageUrl: coverImageUrl?.trim() || undefined,
      visibility: visibility === 'Public' ? 'Public' : 'Private',
      ownerEmail: user.email,
      ownerName: user.name,
    });
    return NextResponse.json({ collection }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}
