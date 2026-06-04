import type { AssetStatus } from '@/types/asset';

// Categories are now stored in Appwrite — fetch via GET /api/categories
// or import getCategories() from lib/appwrite-categories on the server.

export const FILE_TYPES = ['SVG', 'PNG', 'JPG'];

export const STATUS_OPTIONS: AssetStatus[] = ['Active', 'Draft', 'Deprecated'];

export const STATUS_COLORS: Record<AssetStatus, string> = {
  Active: 'bg-green-100 text-green-800 border-green-200',
  Draft: 'bg-amber-100 text-amber-800 border-amber-200',
  Deprecated: 'bg-red-100 text-red-800 border-red-200',
};
