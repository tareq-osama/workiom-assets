export type AssetFormat = 'SVG' | 'PNG' | 'JPG';
export type AssetStatus = 'Active' | 'Deprecated' | 'Draft';
export type AssetCategory =
  | 'Brand Items'
  | 'Logos'
  | 'Client Logos'
  | 'Brand Icons'
  | 'Brand Illustrations'
  | 'Canva Templates'
  | 'Ready to Design Brochures';

export interface Asset {
  id: string;
  name: string;
  description?: string;
  category: AssetCategory;
  tags: string[];
  status: AssetStatus;
  owner: string;
  downloadCount: number;
  deprecationReason?: string;
  createdAt?: string;

  // Available download formats for this asset
  formats: AssetFormat[];

  // Appwrite Storage file IDs per format
  svgFileId?: string;
  pngFileId?: string;
  jpgFileId?: string;
  thumbnailFileId?: string;

  // Resolved view URLs (derived from fileIds)
  svgUrl?: string;
  pngUrl?: string;
  jpgUrl?: string;
  thumbnailUrl?: string;

  // Convenience fields (primary format)
  fileUrl: string;
  fileType: string;
  fileSize: number;
}
