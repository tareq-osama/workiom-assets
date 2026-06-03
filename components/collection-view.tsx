'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { FolderOpen, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AssetCard from '@/components/asset-card';
import type { Asset } from '@/types/asset';

interface CollectionViewProps {
  assets: Asset[];
  collectionId: string;
  shareToken: string;
  isOwner: boolean;
}

export default function CollectionView({ assets: initial, collectionId, isOwner }: CollectionViewProps) {
  const [assets, setAssets] = useState<Asset[]>(initial);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const removeAsset = useCallback(async (assetId: string) => {
    setRemovingId(assetId);
    try {
      const res = await fetch(`/api/collections/${collectionId}/assets`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId }),
      });
      if (res.ok) {
        setAssets(prev => prev.filter(a => a.id !== assetId));
      }
    } finally {
      setRemovingId(null);
    }
  }, [collectionId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {assets.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <FolderOpen className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">This collection is empty</h3>
          <p className="text-slate-500 text-sm mb-6">
            {isOwner
              ? 'Browse assets and click "Collect" to add them here.'
              : 'No assets have been added yet.'}
          </p>
          {isOwner && (
            <Link href="/browse">
              <Button className="gap-2 bg-[#4E86F7] hover:bg-[#3a72e3] text-white">
                <Plus className="h-4 w-4" /> Browse Assets
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          {isOwner && (
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-500">{assets.length} asset{assets.length !== 1 ? 's' : ''}</p>
              <Link href="/browse">
                <Button variant="outline" size="sm" className="gap-2 text-sm">
                  <Plus className="h-4 w-4" /> Add Assets
                </Button>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {assets.map(asset => (
              <div key={asset.id} className="group relative">
                <AssetCard asset={asset} viewMode="grid" />
                {/* Remove button — owner only */}
                {isOwner && (
                  <Tooltip>
                    <TooltipTrigger
                      className="absolute top-2 right-2 z-10 inline-flex items-center justify-center h-7 w-7 rounded-full bg-white/90 border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm"
                      onClick={() => !removingId && removeAsset(asset.id)}
                    >
                      {removingId === asset.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <X className="h-3.5 w-3.5" />
                      }
                    </TooltipTrigger>
                    <TooltipContent>Remove from collection</TooltipContent>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
