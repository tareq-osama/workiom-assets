'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FolderOpen, Plus, Globe, Lock, Loader2, Copy, Check,
  MoreHorizontal, Trash2, ExternalLink, Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Collection } from '@/lib/workiom-collections';

function CollectionCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

function CoverGrid({ coverUrl, name }: { coverUrl?: string; name: string }) {
  if (coverUrl) {
    return (
      <div className="aspect-video relative overflow-hidden bg-slate-100">
        <Image src={coverUrl} alt={name} fill className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    );
  }
  return (
    <div className="aspect-video bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
      <FolderOpen className="h-12 w-12 text-blue-200" />
    </div>
  );
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCollections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/collections');
      if (!res.ok) return;
      const data = await res.json() as { collections?: Collection[]; configured?: boolean };
      setConfigured(data.configured ?? true);
      setCollections(data.collections ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCollections(); }, [loadCollections]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
      });
      if (res.ok) {
        const data = await res.json() as { collection?: Collection };
        if (data.collection) {
          setCollections(prev => [data.collection!, ...prev]);
          setCreateOpen(false);
          setNewName('');
          setNewDesc('');
        }
      }
    } finally {
      setCreating(false);
    }
  }

  async function toggleVisibility(coll: Collection) {
    setTogglingId(coll.id);
    try {
      const newVis = coll.visibility === 'Public' ? 'Private' : 'Public';
      await fetch(`/api/collections/${coll.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: newVis }),
      });
      setCollections(prev => prev.map(c => c.id === coll.id ? { ...c, visibility: newVis } : c));
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteCollection(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/collections/${id}`, { method: 'DELETE' });
      setCollections(prev => prev.filter(c => c.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  function copyShareLink(coll: Collection) {
    const url = `${window.location.origin}/collections/${coll.shareToken}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedId(coll.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filtered = collections.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-900">Collections</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {loading ? '…' : `${collections.length} collection${collections.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="relative hidden sm:block w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search collections…"
              className="pl-9 h-9 text-sm bg-white"
            />
          </div>
          <Button
            className="h-9 gap-2 bg-[#4E86F7] hover:bg-[#3a72e3] text-white flex-shrink-0"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Collection</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Not configured */}
        {!configured && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Collections not set up yet</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Add <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">WORKIOM_COLLECTIONS_LIST_ID</code> to your environment variables.
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {configured && loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <CollectionCardSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {configured && !loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <FolderOpen className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {search ? 'No collections match your search' : 'No collections yet'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {search ? 'Try a different keyword.' : 'Group your favourite assets into collections to keep things organised.'}
            </p>
            {!search && (
              <Button
                className="gap-2 bg-[#4E86F7] hover:bg-[#3a72e3] text-white"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Create your first collection
              </Button>
            )}
          </div>
        )}

        {/* Grid */}
        {configured && !loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(coll => (
              <div
                key={coll.id}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200"
              >
                {/* Cover */}
                <Link href={`/collections/${coll.shareToken}`}>
                  <CoverGrid coverUrl={coll.coverImageUrl} name={coll.name} />
                </Link>

                {/* Footer */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link href={`/collections/${coll.shareToken}`} className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-slate-900 truncate hover:text-blue-600 transition-colors">
                        {coll.name}
                      </h3>
                    </Link>
                    {/* Overflow menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
                        {deletingId === coll.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer p-0">
                          <Link href={`/collections/${coll.shareToken}`} className="flex items-center gap-2 w-full px-2 py-1.5">
                            <ExternalLink className="h-4 w-4" /> Open collection
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => toggleVisibility(coll)}
                          disabled={togglingId === coll.id}
                        >
                          {togglingId === coll.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : coll.visibility === 'Public'
                              ? <Lock className="h-4 w-4" />
                              : <Globe className="h-4 w-4" />
                          }
                          Make {coll.visibility === 'Public' ? 'private' : 'public'}
                        </DropdownMenuItem>
                        {coll.visibility === 'Public' && (
                          <DropdownMenuItem
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => copyShareLink(coll)}
                          >
                            {copiedId === coll.id
                              ? <Check className="h-4 w-4 text-emerald-500" />
                              : <Copy className="h-4 w-4" />
                            }
                            {copiedId === coll.id ? 'Link copied!' : 'Copy share link'}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                          onClick={() => deleteCollection(coll.id)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {coll.description && (
                    <p className="text-xs text-slate-500 truncate mb-2">{coll.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {coll.assetIds.length} asset{coll.assetIds.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {coll.visibility === 'Public' ? (
                        <>
                          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50 gap-1 py-0 h-5">
                            <Globe className="h-2.5 w-2.5" /> Public
                          </Badge>
                          <button
                            onClick={() => copyShareLink(coll)}
                            className="inline-flex items-center justify-center h-5 w-5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Copy share link"
                          >
                            {copiedId === coll.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-xs text-slate-500 border-slate-200 bg-slate-50 gap-1 py-0 h-5">
                          <Lock className="h-2.5 w-2.5" /> Private
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="!max-w-md w-full p-6">
          <DialogTitle className="text-lg font-semibold text-slate-900 mb-4">New Collection</DialogTitle>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Name</Label>
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Q3 Campaign Assets"
                className="h-10"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleCreate()}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Description <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="What's this collection for?"
                className="resize-none h-20 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button
                className="bg-[#4E86F7] hover:bg-[#3a72e3] text-white gap-2"
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Collection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
