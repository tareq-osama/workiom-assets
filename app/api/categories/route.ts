import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getCategories, createCategory } from '@/lib/appwrite-categories';

export const revalidate = 60; // refresh at most once per minute

export async function GET() {
  try {
    const categories = await getCategories();
    return Response.json({ categories });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return Response.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) return NextResponse.json({ error: 'Category name is required' }, { status: 400 });

    const existing = await getCategories();
    const match = existing.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (match) return NextResponse.json(match);

    const category = await createCategory({
      name,
      icon: typeof body.icon === 'string' && body.icon ? body.icon : 'Folder',
      color: typeof body.color === 'string' && body.color ? body.color : 'slate',
      description: typeof body.description === 'string' ? body.description : '',
      order: existing.length,
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create category' },
      { status: 500 }
    );
  }
}
