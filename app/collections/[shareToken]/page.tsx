import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { ArrowLeft, FolderOpen, Lock, Globe, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { workiomCollections } from '@/lib/workiom-collections';
import { getAssets } from '@/lib/workiom';
import { verifyToken } from '@/lib/auth';
import type { Asset } from '@/types/asset';
import CollectionView from '@/components/collection-view';

export const dynamic = 'force-dynamic';

export default async function SharedCollectionPage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;

  if (!workiomCollections.configured) notFound();

  const collection = await workiomCollections.getByShareToken(shareToken);
  if (!collection) notFound();

  // Check if current user is the owner
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = token ? await verifyToken(token) : null;
  const isOwner = !!user && user.email.toLowerCase() === collection.ownerEmail.toLowerCase();

  // Private collection — only owner can view
  if (collection.visibility !== 'Public' && !isOwner) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-slate-400" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Private Collection</h1>
          <p className="text-slate-500 text-sm mb-6">This collection is private.</p>
          <Link href="/browse" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4" /> Browse Assets
          </Link>
        </div>
      </div>
    );
  }

  // Fetch assets — get all assets and filter by collection's asset IDs
  // (We fetch a large batch and cross-reference since MCP doesn't support ID-based filtering)
  let assets: Asset[] = [];
  if (collection.assetIds.length > 0) {
    const { assets: allAssets } = await getAssets({ limit: 200 });
    const idSet = new Set(collection.assetIds);
    // preserve order from collection
    const assetMap = new Map(allAssets.map(a => [a.id, a]));
    assets = collection.assetIds.map(id => assetMap.get(id)).filter((a): a is Asset => !!a);
    // fall back: any matched but not in map (edge case)
    const unmapped = allAssets.filter(a => idSet.has(a.id) && !assetMap.has(a.id));
    assets = [...assets, ...unmapped];
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/collections/${shareToken}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={isOwner ? '/collections' : '/browse'}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {isOwner ? 'My Collections' : 'Browse'}
          </Link>

          <div className="flex items-start gap-5">
            {/* Cover */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100 flex-shrink-0 border border-slate-200">
              {collection.coverImageUrl ? (
                <Image
                  src={collection.coverImageUrl}
                  alt={collection.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FolderOpen className="h-10 w-10 text-blue-200" />
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{collection.name}</h1>
                {collection.visibility === 'Public' ? (
                  <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50 gap-1">
                    <Globe className="h-3 w-3" /> Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-slate-500 border-slate-200 bg-slate-50 gap-1">
                    <Lock className="h-3 w-3" /> Private
                  </Badge>
                )}
              </div>
              {collection.description && (
                <p className="text-slate-500 text-sm mb-2 max-w-xl">{collection.description}</p>
              )}
              <p className="text-xs text-slate-400">
                By {collection.ownerName} · {assets.length} asset{assets.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Share link (public only) */}
            {collection.visibility === 'Public' && (
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <span className="text-xs text-slate-500 max-w-[180px] truncate">{shareUrl}</span>
                <Copy className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assets — client component handles remove action for owner */}
      <CollectionView
        assets={assets}
        collectionId={collection.id}
        shareToken={shareToken}
        isOwner={isOwner}
      />
    </div>
  );
}
