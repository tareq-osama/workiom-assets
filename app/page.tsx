import Link from 'next/link';
import {
  Star,
  Layers,
  Building2,
  Shapes,
  Pen,
  LayoutTemplate,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AssetCard from '@/components/asset-card';
import HeroSearch from '@/components/hero-search';
import { getAssets } from '@/lib/appwrite-assets';
import type { AssetCategory } from '@/types/asset';

const CATEGORY_ICONS: Record<AssetCategory, React.ElementType> = {
  'Brand Items': Star,
  Logos: Layers,
  'Client Logos': Building2,
  'Brand Icons': Shapes,
  'Brand Illustrations': Pen,
  'Canva Templates': LayoutTemplate,
  'Ready to Design Brochures': BookOpen,
};

const CATEGORIES: AssetCategory[] = [
  'Brand Items',
  'Logos',
  'Client Logos',
  'Brand Icons',
  'Brand Illustrations',
  'Canva Templates',
  'Ready to Design Brochures',
];

const CATEGORY_COLORS: Record<AssetCategory, string> = {
  'Brand Items': 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100',
  Logos: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100',
  'Client Logos': 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
  'Brand Icons': 'bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-100',
  'Brand Illustrations': 'bg-pink-50 text-pink-600 border-pink-100 hover:bg-pink-100',
  'Canva Templates': 'bg-teal-50 text-teal-600 border-teal-100 hover:bg-teal-100',
  'Ready to Design Brochures': 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let recentAssets: Awaited<ReturnType<typeof getAssets>>['assets'] = [];
  let topAssets: Awaited<ReturnType<typeof getAssets>>['assets'] = [];

  const [recentResult, topResult] = await Promise.allSettled([
    getAssets({ limit: 8 }),
    getAssets({ limit: 8 }),
  ]);

  if (recentResult.status === 'fulfilled') recentAssets = recentResult.value.assets;
  if (topResult.status === 'fulfilled') topAssets = topResult.value.assets;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50 border-b border-slate-100 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Brand Assets Library
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto">
            Your centralized hub for logos, icons, illustrations, and brand resources — available
            in SVG, PNG, and JPG.
          </p>
          <div className="flex justify-center px-4">
            <HeroSearch />
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/browse">
              <Button variant="outline" className="h-10 gap-2 text-slate-600 border-slate-200">
                Browse All Assets
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/upload">
              <Button className="h-10 bg-[#4E86F7] hover:bg-[#3a72e3] text-white gap-2">
                Upload Asset
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Quick Links */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              const colorClass = CATEGORY_COLORS[cat];
              return (
                <Link
                  key={cat}
                  href={`/browse?category=${encodeURIComponent(cat)}`}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors cursor-pointer ${colorClass}`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium text-center leading-tight">{cat}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recently Added */}
      {recentAssets.length > 0 && (
        <section className="py-10 bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-slate-900">Recently Added</h2>
              <Link
                href="/browse"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
              {recentAssets.map((asset) => (
                <div key={asset.id} className="w-52 flex-shrink-0">
                  <AssetCard asset={asset} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Most Downloaded */}
      {topAssets.length > 0 && (
        <section className="py-10 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-slate-900">Most Downloaded</h2>
              <Link
                href="/browse"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {topAssets.map((asset) => (
                <div key={asset.id} className="w-52 flex-shrink-0">
                  <AssetCard asset={asset} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {recentAssets.length === 0 && (
        <section className="py-20 text-center">
          <div className="max-w-md mx-auto px-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No assets yet</h3>
            <p className="text-slate-500 text-sm mb-6">
              Upload your first brand asset to get started.
            </p>
            <Link href="/upload">
              <Button className="bg-[#4E86F7] hover:bg-[#3a72e3] text-white">
                Upload Asset
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
