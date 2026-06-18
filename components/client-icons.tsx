'use client';

// Re-export Lucide icons for use in server components.
// Lucide v1.x uses useContext internally, which can only run in client components.
// Importing from this file creates the required 'use client' boundary.
export {
  ArrowRight,
  ArrowLeft,
  Folder,
  FolderOpen,
  Download,
  User,
  Tag,
  TrendingDown,
  Lock,
  Globe,
  Layers,
} from 'lucide-react';
