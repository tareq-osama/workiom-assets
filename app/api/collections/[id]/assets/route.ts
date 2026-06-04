import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { addAssetToCollection, removeAssetFromCollection } from '@/lib/appwrite-collections';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as {
    assetId?: string;
    thumbnailUrl?: string;
    fileUrl?: string;
  };

  if (!body.assetId) return NextResponse.json({ error: 'assetId required' }, { status: 400 });

  try {
    const collection = await addAssetToCollection(id, body.assetId, {
      thumbnailUrl: body.thumbnailUrl,
      fileUrl: body.fileUrl,
    });
    return NextResponse.json({ collection });
  } catch (err) {
    console.error('addAsset error:', err);
    return NextResponse.json({ error: 'Failed to add asset' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { assetId } = (await request.json()) as { assetId?: string };
  if (!assetId) return NextResponse.json({ error: 'assetId required' }, { status: 400 });

  try {
    const collection = await removeAssetFromCollection(id, assetId);
    return NextResponse.json({ collection });
  } catch (err) {
    console.error('removeAsset error:', err);
    return NextResponse.json({ error: 'Failed to remove asset' }, { status: 500 });
  }
}
