import type { AssetCategory, AssetStatus } from '@/types/asset';

export const CATEGORIES: AssetCategory[] = [
  'Brand Items',
  'Logos',
  'Client Logos',
  'Brand Icons',
  'Brand Illustrations',
  'Canva Templates',
  'Ready to Design Brochures',
];

export const CATEGORY_META: Record<
  AssetCategory,
  {
    icon: string;
    color: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    description: string;
  }
> = {
  'Brand Items': {
    icon: 'Star',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-100',
    description: 'Core brand assets including primary marks and identity elements',
  },
  Logos: {
    icon: 'Layers',
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-100',
    description: 'Official logo files in all variants and color modes',
  },
  'Client Logos': {
    icon: 'Building2',
    color: 'slate',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    description: "Approved logos from clients and partner organizations",
  },
  'Brand Icons': {
    icon: 'Shapes',
    color: 'violet',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-100',
    description: 'Icon sets and custom UI icons that follow brand guidelines',
  },
  'Brand Illustrations': {
    icon: 'Pen',
    color: 'pink',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-100',
    description: 'Spot illustrations and decorative graphics in brand style',
  },
  'Canva Templates': {
    icon: 'LayoutTemplate',
    color: 'teal',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-100',
    description: 'Ready-to-use Canva templates for social, presentations, and more',
  },
  'Ready to Design Brochures': {
    icon: 'BookOpen',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-100',
    description: 'Pre-structured brochure layouts ready to populate with content',
  },
};

export const CATEGORY_ICONS: Record<AssetCategory, string> = {
  'Brand Items': 'Star',
  Logos: 'Layers',
  'Client Logos': 'Building2',
  'Brand Icons': 'Shapes',
  'Brand Illustrations': 'Pen',
  'Canva Templates': 'LayoutTemplate',
  'Ready to Design Brochures': 'BookOpen',
};

export const FILE_TYPES = ['SVG', 'PNG', 'JPG'];

export const STATUS_OPTIONS: AssetStatus[] = ['Active', 'Draft', 'Deprecated'];

export const STATUS_COLORS: Record<AssetStatus, string> = {
  Active: 'bg-green-100 text-green-800 border-green-200',
  Draft: 'bg-amber-100 text-amber-800 border-amber-200',
  Deprecated: 'bg-red-100 text-red-800 border-red-200',
};
