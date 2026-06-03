export type AssetStatus = 'Active' | 'Deprecated' | 'Draft';
export type AssetCategory =
  | 'Logos'
  | 'Brand Guidelines'
  | 'Templates'
  | 'Campaign Materials'
  | 'Icons & Illustrations'
  | 'Photography'
  | 'Videos'
  | 'Documents';

export interface Asset {
  id: string;
  name: string;
  description?: string;
  category: AssetCategory;
  tags: string[];
  fileUrl: string;
  thumbnailUrl?: string;
  status: AssetStatus;
  owner: string;
  fileType: string;
  fileSize: number;
  downloadCount: number;
  deprecationReason?: string;
  createdAt?: string;
}
