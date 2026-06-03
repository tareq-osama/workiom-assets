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

export const CATEGORY_META: Record<AssetCategory, {
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
  subcategories: string[];
}> = {
  'Logos': {
    icon: 'Layers',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-100',
    description: 'Official logo files in all formats and variants',
    subcategories: ['Primary Logo', 'Secondary Logo', 'Logomark', 'Wordmark', 'Logo on Dark', 'Logo on Light', 'Logo Variants'],
  },
  'Brand Guidelines': {
    icon: 'BookOpen',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-100',
    description: 'Brand standards, style guides, and visual identity rules',
    subcategories: ['Color Palette', 'Typography', 'Spacing & Grid', 'Icon Style', 'Photography Style', 'Brand Voice', 'Do & Don\'t'],
  },
  'Templates': {
    icon: 'LayoutTemplate',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-100',
    description: 'Ready-to-use templates for common documents and designs',
    subcategories: ['Presentations', 'Word Documents', 'Social Media', 'Email Templates', 'Proposals', 'Reports', 'Pitch Decks'],
  },
  'Campaign Materials': {
    icon: 'Megaphone',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-100',
    description: 'Marketing and campaign assets for all channels',
    subcategories: ['Digital Ads', 'Print Materials', 'Banners', 'Social Posts', 'Landing Pages', 'Email Campaigns', 'OOH'],
  },
  'Icons & Illustrations': {
    icon: 'Pen',
    color: 'pink',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-100',
    description: 'Icon sets and custom illustrations for product and marketing',
    subcategories: ['UI Icons', 'Brand Icons', 'Spot Illustrations', 'Infographics', 'Diagrams', 'Avatars', 'Stickers'],
  },
  'Photography': {
    icon: 'Camera',
    color: 'cyan',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-100',
    description: 'Approved photography for marketing, PR, and internal use',
    subcategories: ['Team Photos', 'Office & Culture', 'Product Shots', 'Event Photography', 'Stock Photos', 'Headshots'],
  },
  'Videos': {
    icon: 'Video',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-100',
    description: 'Video content for all platforms and use cases',
    subcategories: ['Brand Films', 'Product Demos', 'Social Media Videos', 'Tutorials', 'Event Recordings', 'Animations', 'Ads'],
  },
  'Documents': {
    icon: 'FileText',
    color: 'slate',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    description: 'Official documents, reports, and company materials',
    subcategories: ['One-Pagers', 'Case Studies', 'White Papers', 'Guides & Playbooks', 'Contracts', 'Company Info', 'Press Kits'],
  },
};

export const FILE_TYPES: string[] = [
  'PNG', 'SVG', 'JPG', 'JPEG', 'GIF', 'WebP',
  'PDF', 'AI', 'EPS', 'PSD', 'Figma',
  'MP4', 'MOV', 'WEBM',
  'DOCX', 'PPTX', 'XLSX',
  'ZIP', 'TTF', 'OTF', 'WOFF',
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
