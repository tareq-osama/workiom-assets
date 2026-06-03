import type { AssetCategory, AssetStatus } from '@/types/asset';

export const CATEGORIES: AssetCategory[] = [
  'Logos',
  'Brand Guidelines',
  'Templates',
  'Campaign Materials',
  'Icons & Illustrations',
  'Photography',
  'Videos',
  'Documents',
];

export const FILE_TYPES: string[] = [
  'PNG',
  'SVG',
  'JPG',
  'JPEG',
  'GIF',
  'WebP',
  'PDF',
  'AI',
  'EPS',
  'PSD',
  'MP4',
  'MOV',
  'DOCX',
  'PPTX',
  'XLSX',
  'ZIP',
];

export const STATUS_OPTIONS: AssetStatus[] = ['Active', 'Draft', 'Deprecated'];

export const STATUS_COLORS: Record<AssetStatus, string> = {
  Active: 'bg-green-100 text-green-800 border-green-200',
  Draft: 'bg-amber-100 text-amber-800 border-amber-200',
  Deprecated: 'bg-red-100 text-red-800 border-red-200',
};

export const CATEGORY_ICONS: Record<AssetCategory, string> = {
  Logos: 'Layers',
  'Brand Guidelines': 'BookOpen',
  Templates: 'LayoutTemplate',
  'Campaign Materials': 'Megaphone',
  'Icons & Illustrations': 'Pen',
  Photography: 'Camera',
  Videos: 'Video',
  Documents: 'FileText',
};
