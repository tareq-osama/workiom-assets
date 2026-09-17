export type AssetFormat = 'SVG' | 'PNG' | 'JPG' | 'MP4' | 'PDF' | 'DOC' | 'XLS' | 'PPT';
export type AssetStatus = 'Active' | 'Deprecated' | 'Draft';
export type AssetCategory = string; // dynamic — managed in Appwrite categories collection

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

  // External link URL — present when the asset is a clickable link (e.g. a Canva presentation)
  linkUrl?: string;

  // Optional background color shown behind the thumbnail (e.g. for light/white logos)
  backgroundColor?: string;

  // Convenience fields (primary format)
  fileUrl: string;
  fileType: string;
  fileSize: number;
}
