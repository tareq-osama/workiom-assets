import { NextRequest } from 'next/server';
import { requestUploadUrl, confirmUpload } from '@/lib/workiom';

export async function POST(request: NextRequest) {
  try {
    const { fileName, contentType, fileSize } = await request.json();

    if (!fileName || !contentType || !fileSize) {
      return Response.json(
        { error: 'fileName, contentType, and fileSize are required' },
        { status: 400 }
      );
    }

    const result = await requestUploadUrl(fileName, contentType, fileSize);
    return Response.json(result);
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to request upload URL' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { fileToken } = await request.json();

    if (!fileToken) {
      return Response.json({ error: 'fileToken is required' }, { status: 400 });
    }

    const result = await confirmUpload(fileToken);
    return Response.json(result);
  } catch (error) {
    console.error('PUT /api/upload error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm upload' },
      { status: 500 }
    );
  }
}
