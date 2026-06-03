import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { workiomCollections } from '@/lib/workiom-collections';
import { getAsset } from '@/lib/workiom';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { assetId } = await request.json() as { assetId?: string };
  if (!assetId) return NextResponse.json({ error: 'assetId required' }, { status: 400 });

  try {
    const asset = await getAsset(assetId);
    if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    const collection = await workiomCollections.addAsset(id, asset);
    return NextResponse.json({ collection });
  } catch {
    return NextResponse.json({ error: 'Failed to add asset' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { assetId } = await request.json() as { assetId?: string };
  if (!assetId) return NextResponse.json({ error: 'assetId required' }, { status: 400 });

  try {
    const collection = await workiomCollections.removeAsset(id, assetId);
    return NextResponse.json({ collection });
  } catch {
    return NextResponse.json({ error: 'Failed to remove asset' }, { status: 500 });
  }
}
