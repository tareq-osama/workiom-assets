'use client';

import {
  Star, Layers, Building2, Shapes, Pen, LayoutTemplate, BookOpen,
  Folder, Image, Video, FileText, Music, Code2, Package, Globe,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Star, Layers, Building2, Shapes, Pen, LayoutTemplate, BookOpen,
  Folder, Image, Video, FileText, Music, Code2, Package, Globe,
};

export function getCategoryIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Folder;
}
