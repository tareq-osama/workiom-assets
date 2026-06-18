'use client';

import { getCategoryIcon } from '@/lib/category-icons';

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = getCategoryIcon(icon);
  return <Icon className={className} />;
}
