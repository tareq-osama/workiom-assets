'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FolderOpen, Plus, Globe, Lock, Loader2, Copy, Check,
  MoreHorizontal, Trash2, ExternalLink, Search, ArrowUpDown,
  Calendar, Image as ImageIcon,
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
import type { Collection } from '@/lib/appwrite-collections';
import { cn } from '@/lib/utils';

type SortKey = 'date' | 'name' | 'assets';
type VisibilityFilter = 'all' | 'public' | 'private';

function CollectionCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-1/2" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function CollectionCover({ coverUrl, name }: { coverUrl?: string; name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  if (coverUrl) {
    return (
      <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
        <Image src={coverUrl} alt={name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    );
  }
  return (
    <div
      className="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 55%, 82%), hsl(${(hue + 50) % 360}, 55%, 88%))`,
      }}
    >
      <span
        className="text-7xl font-bold select-none opacity-25"
        style={{ color: `hsl(${hue}, 45%, 25%)` }}
      >
        {initial}
      </span>
      <div
        className="absolute bottom-0 right-0 w-28 h-28 rounded-full opacity-15 translate-x-8 translate-y-8"
        style={{ background: `hsl(${(hue + 30) % 360}, 65%, 50%)` }}
      />
    </div>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
  } catch {
    return '';
  }
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('date');
  const [visFilter, setVisFilter] = useState<VisibilityFilter>('all');
  const [createOpen, setCreateOpen] = useState(false);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [newVisibility, setNewVisibility] = useState<'Private' | 'Public'>('Private');
  const [creating, setCreating] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCollections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/collections');
      if (!res.ok) return;
      const data = await res.json() as { collections?: Collection[] };
      setCollections(data.collections ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCollections(); }, [loadCollections]);

  function resetForm() {
    setNewName('');
    setNewDesc('');
    setNewCoverUrl('');
    setNewVisibility('Private');
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDesc.trim(),
          coverImageUrl: newCoverUrl.trim() || undefined,
          visibility: newVisibility,
        }),
      });
      if (res.ok) {
        const data = await res.json() as { collection?: Collection };
        if (data.collection) {
          setCollections(prev => [data.collection!, ...prev]);
          setCreateOpen(false);
          resetForm();
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

  const filtered = useMemo(() => {
    let result = collections.filter(c => {
      const q = search.toLowerCase();
      return !q || c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q);
    });
    if (visFilter === 'public') result = result.filter(c => c.visibility === 'Public');
    else if (visFilter === 'private') result = result.filter(c => c.visibility === 'Private');
    return [...result].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'assets') return b.assetIds.length - a.assetIds.length;
      return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
    });
  }, [collections, search, visFilter, sort]);

  const publicCount = collections.filter(c => c.visibility === 'Public').length;
  const sortLabels: Record<SortKey, string> = { date: 'Newest first', name: 'Name A–Z', assets: 'Most assets' };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky sub-header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-900">Collections</h1>
                {!loading && collections.length > 0 && (
                  <span className="text-sm text-slate-400">
                    {collections.length} total · {publicCount} public
                  </span>
                )}
              </div>
            </div>

            <div className="relative hidden sm:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search collections…"
                className="pl-9 h-9 text-sm bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <ArrowUpDown className="h-3.5 w-3.5" />
                {sortLabels[sort]}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {(['date', 'name', 'assets'] as SortKey[]).map(k => (
                  <DropdownMenuItem
                    key={k}
                    className={cn('cursor-pointer', sort === k && 'font-medium text-[#4E86F7]')}
                    onClick={() => setSort(k)}
                  >
                    {sortLabels[k]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              className="h-9 gap-2 bg-[#4E86F7] hover:bg-[#3a72e3] text-white flex-shrink-0"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Collection</span>
            </Button>
          </div>

          {/* Visibility filter tabs */}
          {!loading && collections.length > 0 && (
            <div className="flex items-center gap-1 pb-3 -mt-1">
              {(['all', 'public', 'private'] as VisibilityFilter[]).map(v => (
                <button
                  key={v}
                  onClick={() => setVisFilter(v)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize',
                    visFilter === v
                      ? 'bg-[#4E86F7] text-white'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  )}
                >
                  {v === 'all' ? `All (${collections.length})` : v === 'public' ? `Public (${publicCount})` : `Private (${collections.length - publicCount})`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden bg-white border-b border-slate-100 px-4 py-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search collections…"
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Not configured */}
        {!configured && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Collections not set up yet</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Add <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">WORKIOM_COLLECTIONS_LIST_ID</code> to your environment variables.
            </p>
          </div>
        )}

        {/* Skeleton */}
        {configured && loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <CollectionCardSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {configured && !loading && filtered.length === 0 && (
          <div className="text-center py-28">
            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {search || visFilter !== 'all' ? 'No collections match' : 'No collections yet'}
            </h3>
            <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">
              {search ? `No results for "${search}".` : visFilter !== 'all' ? 'Try switching to All.' : 'Group your favourite assets into collections to share and organise them.'}
            </p>
            {!search && visFilter === 'all' && (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(coll => (
              <div
                key={coll.id}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200"
              >
                <Link href={`/collections/${coll.shareToken}`} className="block overflow-hidden">
                  <CollectionCover coverUrl={coll.coverImageUrl} name={coll.name} />
                </Link>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <Link href={`/collections/${coll.shareToken}`} className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 leading-snug hover:text-[#4E86F7] transition-colors line-clamp-1">
                        {coll.name}
                      </h3>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
                        {deletingId === coll.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <MoreHorizontal className="h-4 w-4" />
                        }
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem className="p-0 cursor-pointer">
                          <Link href={`/collections/${coll.shareToken}`} className="flex items-center gap-2 w-full px-2 py-1.5 text-sm">
                            <ExternalLink className="h-4 w-4" /> Open collection
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer text-sm"
                          onClick={() => toggleVisibility(coll)}
                          disabled={togglingId === coll.id}
                        >
                          {togglingId === coll.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : coll.visibility === 'Public' ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />
                          }
                          Make {coll.visibility === 'Public' ? 'private' : 'public'}
                        </DropdownMenuItem>
                        {coll.visibility === 'Public' && (
                          <DropdownMenuItem
                            className="flex items-center gap-2 cursor-pointer text-sm"
                            onClick={() => copyShareLink(coll)}
                          >
                            {copiedId === coll.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                            {copiedId === coll.id ? 'Copied!' : 'Copy share link'}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer text-sm text-red-600 focus:text-red-600"
                          onClick={() => deleteCollection(coll.id)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {coll.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-3">{coll.description}</p>
                  )}

                  <div className="flex items-center justify-between gap-2 mt-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-medium">
                        {coll.assetIds.length} {coll.assetIds.length === 1 ? 'asset' : 'assets'}
                      </span>
                      {coll.createdAt && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(coll.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {coll.visibility === 'Public' ? (
                        <>
                          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50 gap-1 py-0 h-5 font-medium">
                            <Globe className="h-2.5 w-2.5" /> Public
                          </Badge>
                          <button
                            onClick={() => copyShareLink(coll)}
                            className="inline-flex items-center justify-center h-6 w-6 rounded-md text-slate-400 hover:text-[#4E86F7] hover:bg-blue-50 transition-colors"
                            title="Copy share link"
                          >
                            {copiedId === coll.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-xs text-slate-500 border-slate-200 bg-slate-50 gap-1 py-0 h-5 font-medium">
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

      {/* ─── Create Collection Dialog ─── */}
      <Dialog open={createOpen} onOpenChange={open => { setCreateOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="!max-w-2xl w-full p-0 overflow-hidden rounded-2xl">
          <div className="px-8 pt-8 pb-5 border-b border-slate-100">
            <DialogTitle className="text-xl font-semibold text-slate-900">New Collection</DialogTitle>
            <p className="text-sm text-slate-500 mt-1">Group related assets together and optionally share them with a link.</p>
          </div>

          <div className="px-8 py-6 space-y-6">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                Collection name <span className="text-red-400">*</span>
              </Label>
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Q3 Campaign Assets"
                className="h-11 text-sm"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleCreate()}
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                Description <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="What's this collection for? e.g. All brand assets for the Q3 product launch campaign."
                className="resize-none h-24 text-sm"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                Cover image URL <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Input
                value={newCoverUrl}
                onChange={e => setNewCoverUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="h-11 text-sm"
              />
              {newCoverUrl && (
                <div className="mt-2.5 rounded-xl overflow-hidden h-32 relative bg-slate-100 border border-slate-200">
                  <Image src={newCoverUrl} alt="Cover preview" fill className="object-cover" unoptimized />
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-3 block">Visibility</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewVisibility('Private')}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all',
                    newVisibility === 'Private'
                      ? 'border-[#4E86F7] bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  )}
                >
                  <Lock className={cn('h-5 w-5 mt-0.5 flex-shrink-0', newVisibility === 'Private' ? 'text-[#4E86F7]' : 'text-slate-400')} />
                  <div>
                    <p className={cn('text-sm font-semibold', newVisibility === 'Private' ? 'text-[#4E86F7]' : 'text-slate-700')}>Private</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">Only you can view and manage this.</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setNewVisibility('Public')}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all',
                    newVisibility === 'Public'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  )}
                >
                  <Globe className={cn('h-5 w-5 mt-0.5 flex-shrink-0', newVisibility === 'Public' ? 'text-emerald-600' : 'text-slate-400')} />
                  <div>
                    <p className={cn('text-sm font-semibold', newVisibility === 'Public' ? 'text-emerald-700' : 'text-slate-700')}>Public</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">Anyone with the link can view.</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="px-5">
              Cancel
            </Button>
            <Button
              className="bg-[#4E86F7] hover:bg-[#3a72e3] text-white gap-2 px-6"
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Collection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
