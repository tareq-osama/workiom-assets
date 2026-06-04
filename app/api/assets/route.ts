import { NextRequest } from 'next/server';
import { getAssets, createAsset } from '@/lib/appwrite-assets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search') ?? undefined;
    const category = searchParams.get('category') ?? undefined;
    const status = searchParams.get('status') ?? undefined;
    const fileType = searchParams.get('fileType') ?? undefined;
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '24', 10);

    const result = await getAssets({ search, category, status, fileType, page, limit });
    return Response.json(result);
  } catch (error) {
    console.error('GET /api/assets error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const asset = await createAsset(body);
    return Response.json(asset, { status: 201 });
  } catch (error) {
    console.error('POST /api/assets error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to create asset' },
      { status: 500 }
    );
  }
}
