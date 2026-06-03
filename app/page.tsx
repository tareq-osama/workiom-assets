import Image from 'next/image';
import Link from 'next/link';
import {
  Layers,
  BookOpen,
  LayoutTemplate,
  Megaphone,
  Pen,
  Camera,
  Video,
  FileText,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AssetCard from '@/components/asset-card';
import HeroSearch from '@/components/hero-search';
import { getAssets } from '@/lib/workiom';
import type { AssetCategory } from '@/types/asset';

const CATEGORY_ICONS: Record<AssetCategory, React.ElementType> = {
  Logos: Layers,
  'Brand Guidelines': BookOpen,
  Templates: LayoutTemplate,
  'Campaign Materials': Megaphone,
  'Icons & Illustrations': Pen,
  Photography: Camera,
  Videos: Video,
  Documents: FileText,
};

const CATEGORIES: AssetCategory[] = [
  'Logos',
  'Brand Guidelines',
  'Templates',
  'Campaign Materials',
  'Icons & Illustrations',
  'Photography',
  'Videos',
  'Documents',
];

const CATEGORY_COLORS: Record<AssetCategory, string> = {
  Logos: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100',
  'Brand Guidelines': 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100',
  Templates: 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100',
  'Campaign Materials': 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100',
  'Icons & Illustrations': 'bg-pink-50 text-pink-600 border-pink-100 hover:bg-pink-100',
  Photography: 'bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100',
  Videos: 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100',
  Documents: 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100',
};

export default async function HomePage() {
  const listIdSet = !!process.env.WORKIOM_LIST_ID;

  let recentAssets: Awaited<ReturnType<typeof getAssets>>['assets'] = [];
  let topAssets: Awaited<ReturnType<typeof getAssets>>['assets'] = [];

  if (listIdSet) {
    const [recentResult, topResult] = await Promise.allSettled([
      getAssets({ limit: 8, sort: [{ field: 'createdAt', direction: 'desc' }] }),
      getAssets({ limit: 8, sort: [{ field: 'Download Count', direction: 'desc' }] }),
    ]);

    if (recentResult.status === 'fulfilled') recentAssets = recentResult.value.assets;
    if (topResult.status === 'fulfilled') topAssets = topResult.value.assets;
  }

  return (
    <div className="flex flex-col">
      {/* Setup banner */}
      {!listIdSet && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>Setup required:</strong> Set{' '}
              <code className="bg-amber-100 px-1 rounded font-mono text-xs">WORKIOM_LIST_ID</code>{' '}
              in your <code className="bg-amber-100 px-1 rounded font-mono text-xs">.env.local</code>{' '}
              to connect to your Workiom assets list.
            </p>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50 border-b border-slate-100 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/workiom-logo.png"
              alt="Workiom"
              width={160}
              height={44}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Assets Library
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto">
            Your centralized hub for brand assets, templates, and creative resources. Find,
            download, and share everything you need.
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
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
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
      {listIdSet && recentAssets.length > 0 && (
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
      {listIdSet && topAssets.length > 0 && (
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

      {/* Empty state when list ID not set */}
      {!listIdSet && (
        <section className="py-16 text-center">
          <div className="max-w-md mx-auto px-4">
            <Image
              src="/workiom-icon.png"
              alt="Workiom"
              width={64}
              height={64}
              className="mx-auto mb-4 opacity-40"
            />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Connect Your Assets List</h3>
            <p className="text-slate-500 text-sm">
              Set your{' '}
              <code className="bg-slate-100 px-1 rounded font-mono text-xs">WORKIOM_LIST_ID</code>{' '}
              environment variable to start managing your assets.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
