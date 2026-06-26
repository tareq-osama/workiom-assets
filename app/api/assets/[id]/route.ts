import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getAsset, updateAsset, deleteAsset } from '@/lib/appwrite-assets';
import { verifyToken } from '@/lib/auth';

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const asset = await getAsset(id);
    if (!asset) {
      return Response.json({ error: 'Asset not found' }, { status: 404 });
    }
    // Increment download count asynchronously
    updateAsset(id, { downloadCount: (asset.downloadCount ?? 0) + 1 }).catch(() => {});
    return Response.json(asset);
  } catch (error) {
    console.error('GET /api/assets/[id] error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const asset = await updateAsset(id, body);
    if (!asset) {
      return Response.json({ error: 'Asset not found or update failed' }, { status: 404 });
    }
    return Response.json(asset);
  } catch (error) {
    console.error('PUT /api/assets/[id] error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to update asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const success = await deleteAsset(id);
    if (!success) {
      return Response.json({ error: 'Asset not found or delete failed' }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/assets/[id] error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
