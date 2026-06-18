import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { ArrowLeft, FolderOpen, Lock, Globe, Layers } from '@/components/client-icons';
import { Badge } from '@/components/ui/badge';
import { getCollectionByShareToken } from '@/lib/appwrite-collections';
import { getAssets } from '@/lib/appwrite-assets';
import { verifyToken } from '@/lib/auth';
import type { Asset } from '@/types/asset';
import CollectionView from '@/components/collection-view';
import CopyShareButton from '@/components/copy-share-button';

export const dynamic = 'force-dynamic';

function CollectionBanner({ coverUrl, name }: { coverUrl?: string; name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  if (coverUrl) {
    return (
      <div className="h-52 sm:h-64 relative overflow-hidden bg-slate-200">
        <Image src={coverUrl} alt={name} fill className="object-cover" unoptimized priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      </div>
    );
  }
  return (
    <div
      className="h-52 sm:h-64 relative overflow-hidden flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 50%, 80%), hsl(${(hue + 60) % 360}, 50%, 87%))`,
      }}
    >
      <span
        className="text-[10rem] font-black select-none opacity-20 leading-none"
        style={{ color: `hsl(${hue}, 40%, 25%)` }}
      >
        {initial}
      </span>
      <div
        className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full opacity-15"
        style={{ background: `hsl(${(hue + 40) % 360}, 60%, 50%)` }}
      />
    </div>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(iso));
  } catch {
    return '';
  }
}

export default async function SharedCollectionPage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;

  const collection = await getCollectionByShareToken(shareToken);
  if (!collection) notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = token ? await verifyToken(token) : null;
  const isOwner = !!user && user.email.toLowerCase() === collection.ownerEmail.toLowerCase();

  if (collection.visibility !== 'Public' && !isOwner) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lock className="h-10 w-10 text-slate-300" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Private Collection</h1>
          <p className="text-slate-500 text-sm mb-6">This collection is private and only accessible to the owner.</p>
          <Link href="/browse" className="inline-flex items-center gap-2 text-sm text-[#4E86F7] hover:text-[#3a72e3] font-medium">
            <ArrowLeft className="h-4 w-4" /> Browse Assets
          </Link>
        </div>
      </div>
    );
  }

  let assets: Asset[] = [];
  if (collection.assetIds.length > 0) {
    const { assets: allAssets } = await getAssets({ limit: 200 });
    const assetMap = new Map(allAssets.map((a) => [a.id, a]));
    assets = collection.assetIds.map((id) => assetMap.get(id)).filter((a): a is Asset => !!a);
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/collections/${shareToken}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Banner */}
      <div className="relative">
        <CollectionBanner coverUrl={collection.coverImageUrl} name={collection.name} />
        <div className="absolute top-4 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href={isOwner ? '/collections' : '/browse'}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white transition-colors shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              {isOwner ? 'My Collections' : 'Browse'}
            </Link>
          </div>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm -mt-10 sm:-mt-12 bg-white ring-4 ring-white">
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
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, hsl(${collection.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360}, 50%, 82%), hsl(${(collection.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + 50) % 360}, 50%, 88%))`,
                  }}
                >
                  <FolderOpen className="h-8 w-8 text-white/70" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{collection.name}</h1>
                {collection.visibility === 'Public' ? (
                  <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50 gap-1 font-medium">
                    <Globe className="h-3 w-3" /> Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-slate-500 border-slate-200 bg-slate-50 gap-1 font-medium">
                    <Lock className="h-3 w-3" /> Private
                  </Badge>
                )}
              </div>

              {collection.description && (
                <p className="text-slate-500 text-sm mb-3 max-w-2xl leading-relaxed">{collection.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-slate-400" />
                  <strong className="text-slate-700">{assets.length}</strong>
                  {assets.length === 1 ? 'asset' : 'assets'}
                </span>
                <span className="text-slate-300">·</span>
                <span>By {collection.ownerName}</span>
                {collection.createdAt && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span>{formatDate(collection.createdAt)}</span>
                  </>
                )}
              </div>
            </div>

            {collection.visibility === 'Public' && <CopyShareButton url={shareUrl} />}
          </div>
        </div>
      </div>

      <CollectionView
        assets={assets}
        collectionId={collection.id}
        shareToken={shareToken}
        isOwner={isOwner}
      />
    </div>
  );
}
