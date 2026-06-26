'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { FolderOpen, Plus, X, Loader2, Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AssetCard from '@/components/asset-card';
import { cn } from '@/lib/utils';
import type { Asset } from '@/types/asset';

const FILE_TYPE_GROUPS = [
  { label: 'Images', types: ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP', 'SVG'] },
  { label: 'Videos', types: ['MP4', 'MOV', 'AVI', 'WEBM'] },
  { label: 'Documents', types: ['PDF', 'DOC', 'DOCX'] },
  { label: 'Spreadsheets', types: ['XLS', 'XLSX', 'CSV'] },
];

function getFileGroup(fileType: string): string {
  const t = fileType.toUpperCase();
  for (const g of FILE_TYPE_GROUPS) {
    if (g.types.includes(t)) return g.label;
  }
  return 'Other';
}

interface CollectionViewProps {
  assets: Asset[];
  collectionId: string;
  shareToken: string;
  isOwner: boolean;
}

export default function CollectionView({ assets: initial, collectionId, isOwner }: CollectionViewProps) {
  const [assets, setAssets] = useState<Asset[]>(initial);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const availableGroups = useMemo(() => {
    const groups = new Set(assets.map(a => getFileGroup(a.fileType)));
    return FILE_TYPE_GROUPS.filter(g => groups.has(g.label)).map(g => g.label);
  }, [assets]);

  const filtered = useMemo(() => {
    let result = assets;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        (a.description ?? '').toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (activeGroup) {
      result = result.filter(a => getFileGroup(a.fileType) === activeGroup);
    }
    return result;
  }, [assets, search, activeGroup]);

  if (assets.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <FolderOpen className="h-12 w-12 text-slate-300" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">This collection is empty</h3>
        <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">
          {isOwner
            ? 'Browse assets and click "Collect" to add them here.'
            : 'No assets have been added to this collection yet.'}
        </p>
        {isOwner && (
          <Link href="/">
            <Button className="gap-2 bg-[#4E86F7] hover:bg-[#3a72e3] text-white">
              <Plus className="h-4 w-4" /> Browse Assets
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search in this collection…"
            className="pl-9 h-9 text-sm bg-white border-slate-200"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {availableGroups.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {availableGroups.map(g => (
              <button
                key={g}
                onClick={() => setActiveGroup(activeGroup === g ? null : g)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                  activeGroup === g
                    ? 'bg-[#4E86F7] text-white border-[#4E86F7]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                )}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-sm text-slate-500 whitespace-nowrap">
            {filtered.length !== assets.length
              ? `${filtered.length} of ${assets.length}`
              : `${assets.length} ${assets.length === 1 ? 'asset' : 'assets'}`}
          </span>

          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'inline-flex items-center justify-center h-8 w-8 transition-colors',
                viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'inline-flex items-center justify-center h-8 w-8 transition-colors',
                viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {isOwner && (
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-1.5 text-sm h-9">
                <Plus className="h-4 w-4" /> Add Assets
              </Button>
            </Link>
          )}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-500 text-sm mb-3">No assets match your search.</p>
          <button
            onClick={() => { setSearch(''); setActiveGroup(null); }}
            className="text-sm text-[#4E86F7] hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {filtered.length > 0 && (
        <div className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
            : 'flex flex-col gap-2'
        )}>
          {filtered.map(asset => (
            <div key={asset.id} className="group relative">
              <AssetCard asset={asset} viewMode={viewMode} />
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
      )}
    </div>
  );
}
