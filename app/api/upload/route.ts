import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { uploadAssetFile } from '@/lib/appwrite-assets';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get('auth-token')?.value;
  if (!rawToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(rawToken);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Browsers occasionally report empty or generic MIME types for SVG/PNG/JPG.
    // Derive the correct type from the file extension so R2 stores it correctly.
    let mimeType = file.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'svg') mimeType = 'image/svg+xml';
      else if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
    }

    const result = await uploadAssetFile(buffer, file.name, mimeType);

    return Response.json(result);
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
