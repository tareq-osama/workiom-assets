import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FolderOpen, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { workiomCollections } from '@/lib/workiom-collections';
import { getAsset } from '@/lib/workiom';
import type { Asset } from '@/types/asset';
import AssetCard from '@/components/asset-card';

export default async function SharedCollectionPage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;

  if (!workiomCollections.configured) notFound();

  const collection = await workiomCollections.getByShareToken(shareToken);
  if (!collection) notFound();
  if (collection.visibility !== 'Public') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-7 w-7 text-slate-400" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Private Collection</h1>
          <p className="text-slate-500 text-sm">This collection is private and cannot be shared.</p>
          <Link href="/browse" className="mt-6 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4" /> Browse Assets
          </Link>
        </div>
      </div>
    );
  }

  // Fetch all assets in the collection
  const assetResults = await Promise.allSettled(
    collection.assetIds.map((id) => getAsset(id))
  );
  const assets: Asset[] = assetResults
    .filter((r): r is PromiseFulfilledResult<Asset | null> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((a): a is Asset => a !== null);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Browse
          </Link>
          <div className="flex items-start gap-4">
            {/* Cover */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
              {collection.coverImageUrl ? (
                <Image
                  src={collection.coverImageUrl}
                  alt={collection.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <FolderOpen className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 truncate">{collection.name}</h1>
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
                  Public
                </Badge>
              </div>
              {collection.description && (
                <p className="text-slate-500 text-sm mb-2">{collection.description}</p>
              )}
              <p className="text-xs text-slate-400">
                By {collection.ownerName} · {assets.length} asset{assets.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assets grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {assets.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">This collection is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} viewMode="grid" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
