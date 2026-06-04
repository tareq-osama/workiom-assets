import { NextRequest } from 'next/server';
import { uploadAssetFile } from '@/lib/appwrite-assets';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadAssetFile(buffer, file.name, file.type);

    return Response.json(result);
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
