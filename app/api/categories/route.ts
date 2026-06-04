import { getCategories } from '@/lib/appwrite-categories';

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
