import { NextRequest } from 'next/server';
import { getAsset, updateAsset, deleteAsset } from '@/lib/workiom';

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

    // Increment download count asynchronously (fire and forget)
    updateAsset(id, { 'Download Count': (asset.downloadCount ?? 0) + 1 }).catch(() => {});

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
