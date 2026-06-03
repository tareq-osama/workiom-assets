'use client';

import { useState, useEffect, useCallback } from 'react';
import { FolderPlus, FolderOpen, Check, Plus, Loader2, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import type { Asset } from '@/types/asset';
import type { Collection } from '@/lib/workiom-collections';

interface CollectionsPopoverProps {
  asset: Asset;
}

export default function CollectionsPopover({ asset }: CollectionsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const loadCollections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/collections');
      if (res.status === 401) return;
      const data = await res.json() as { collections?: Collection[]; configured?: boolean };
      setConfigured(data.configured ?? true);
      setCollections(data.collections ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadCollections();
  }, [open, loadCollections]);

  async function toggleAsset(collection: Collection) {
    const inCollection = collection.assetIds.includes(asset.id);
    setSaving(collection.id);
    try {
      const res = await fetch(`/api/collections/${collection.id}/assets`, {
        method: inCollection ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: asset.id,
          thumbnailUrl: asset.thumbnailUrl,
          fileUrl: asset.fileUrl,
        }),
      });
      if (res.ok) {
        const data = await res.json() as { collection?: Collection };
        if (data.collection) {
          setCollections((prev) => prev.map((c) => (c.id === collection.id ? data.collection! : c)));
        }
      }
    } finally {
      setSaving(null);
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreateLoading(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const data = await res.json() as { collection?: Collection };
        if (data.collection) {
          setCollections((prev) => [data.collection!, ...prev]);
          setNewName('');
          setCreating(false);
          // auto-add current asset to the new collection
          await toggleAsset(data.collection);
        }
      }
    } finally {
      setCreateLoading(false);
    }
  }

  async function shareCollection(collection: Collection, e: React.MouseEvent) {
    e.stopPropagation();
    const isPublic = collection.visibility === 'Public';
    const newVis = isPublic ? 'Private' : 'Public';
    setSaving(collection.id);
    try {
      await fetch(`/api/collections/${collection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: newVis }),
      });
      setCollections((prev) =>
        prev.map((c) => (c.id === collection.id ? { ...c, visibility: newVis } : c))
      );
    } finally {
      setSaving(null);
    }
  }

  function copyShareLink(collection: Collection, e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/collections/${collection.shareToken}`;
    navigator.clipboard.writeText(url).catch(() => {});
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
        <FolderPlus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Collect</span>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 bg-white rounded-xl shadow-lg border border-slate-200" align="end">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">Add to Collection</p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{asset.name}</p>
        </div>

        <div className="max-h-56 overflow-y-auto">
          {!configured ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-slate-500">Collections not configured yet.</p>
              <p className="text-xs text-slate-400 mt-1">Set WORKIOM_COLLECTIONS_LIST_ID in .env</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : collections.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <FolderOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No collections yet</p>
            </div>
          ) : (
            <div className="py-1">
              {collections.map((coll) => {
                const inCollection = coll.assetIds.includes(asset.id);
                const isSaving = saving === coll.id;
                return (
                  <div
                    key={coll.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer group"
                    onClick={() => !isSaving && toggleAsset(coll)}
                  >
                    {/* Checkbox */}
                    <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${inCollection ? 'bg-[#4E86F7] border-[#4E86F7]' : 'border-slate-300'}`}>
                      {isSaving ? (
                        <Loader2 className="h-2.5 w-2.5 animate-spin text-white" />
                      ) : inCollection ? (
                        <Check className="h-2.5 w-2.5 text-white" />
                      ) : null}
                    </div>
                    {/* Cover */}
                    <div className="w-7 h-7 rounded bg-slate-100 flex-shrink-0 overflow-hidden">
                      {coll.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={coll.coverImageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FolderOpen className="h-4 w-4 text-slate-400 m-1.5" />
                      )}
                    </div>
                    {/* Name + count */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{coll.name}</p>
                      <p className="text-xs text-slate-400">{coll.assetIds.length} assets</p>
                    </div>
                    {/* Share / Visibility actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => shareCollection(coll, e)}
                        className="p-1 rounded hover:bg-slate-200 transition-colors"
                        title={coll.visibility === 'Public' ? 'Make private' : 'Make public'}
                      >
                        {coll.visibility === 'Public'
                          ? <Globe className="h-3 w-3 text-emerald-500" />
                          : <Lock className="h-3 w-3 text-slate-400" />}
                      </button>
                      {coll.visibility === 'Public' && (
                        <button
                          onClick={(e) => copyShareLink(coll, e)}
                          className="text-xs text-blue-600 hover:text-blue-800 px-1"
                          title="Copy share link"
                        >
                          Copy link
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        {/* New collection */}
        <div className="p-3">
          {creating ? (
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Collection name"
                className="h-8 text-xs"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') { setCreating(false); setNewName(''); }
                }}
              />
              <Button
                size="sm"
                className="h-8 bg-[#4E86F7] hover:bg-[#3a72e3] text-white flex-shrink-0"
                onClick={handleCreate}
                disabled={createLoading || !newName.trim()}
              >
                {createLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
              </Button>
            </div>
          ) : (
            <button
              className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 w-full py-1 transition-colors"
              onClick={() => setCreating(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              New collection
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
