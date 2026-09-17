'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Download, ExternalLink, FileImage, Link2, Check, TrendingDown, Tag, User,
  Pencil, Trash2, ChevronDown, Loader2, AlertTriangle, X, CloudUpload,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusBadge from '@/components/status-badge';
import CategoryPicker from '@/components/category-picker';
import BackgroundColorPicker from '@/components/background-color-picker';
import type { Asset, AssetFormat, AssetStatus } from '@/types/asset';
import type { UserRole } from '@/types/user';
import type { Category } from '@/lib/appwrite-categories';
import { cn } from '@/lib/utils';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AssetPreviewDialogProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssetUpdated?: (asset: Asset) => void;
  onAssetDeleted?: (assetId: string) => void;
}

interface EditFormState {
  name: string;
  description: string;
  category: string;
  status: AssetStatus;
  tags: string;
  owner: string;
  deprecationReason: string;
  backgroundColor: string;
}

interface EditFormatSlot {
  format: AssetFormat;
  file: File | null;
  previewUrl: string | null;
  existingFileId: string | undefined;
  existingUrl: string | undefined;
  removed: boolean;
}

function getFormatUrl(asset: Asset, format: AssetFormat): string | undefined {
  if (format === 'SVG') return asset.svgUrl;
  if (format === 'PNG') return asset.pngUrl;
  if (format === 'JPG') return asset.jpgUrl;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function triggerDownload(url: string, name: string, format: AssetFormat) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${name}.${format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  } catch {
    window.open(url, '_blank');
  }
}

const FORMAT_COLORS: Record<AssetFormat, string> = {
  SVG: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
  PNG: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  JPG: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  MP4: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
};

const FORMAT_BADGE: Record<AssetFormat, string> = {
  SVG: 'border-violet-200 bg-violet-50 text-violet-700',
  PNG: 'border-blue-200 bg-blue-50 text-blue-700',
  JPG: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  MP4: 'border-rose-200 bg-rose-50 text-rose-700',
};

const FORMAT_DOT: Record<AssetFormat, string> = {
  SVG: 'bg-violet-500',
  PNG: 'bg-blue-500',
  JPG: 'bg-emerald-500',
  MP4: 'bg-rose-500',
};

const FORMAT_ACCEPT: Record<AssetFormat, string> = {
  SVG: '.svg,image/svg+xml',
  PNG: '.png,image/png',
  JPG: '.jpg,.jpeg,image/jpeg',
  MP4: '.mp4,video/mp4',
};

function CopyLinkButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(value); } catch { return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className={cn(
        'flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors',
        copied && 'border-emerald-200 text-emerald-700 bg-emerald-50'
      )}
    >
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}

export default function AssetPreviewDialog({
  asset,
  open,
  onOpenChange,
  onAssetUpdated,
  onAssetDeleted,
}: AssetPreviewDialogProps) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [localAsset, setLocalAsset] = useState<Asset | null>(asset);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [editSlots, setEditSlots] = useState<EditFormatSlot[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const svgInputRef = useRef<HTMLInputElement>(null);
  const pngInputRef = useRef<HTMLInputElement>(null);
  const jpgInputRef = useRef<HTMLInputElement>(null);
  const mp4InputRef = useRef<HTMLInputElement>(null);
  const formatRefs: Record<AssetFormat, React.RefObject<HTMLInputElement | null>> = {
    SVG: svgInputRef,
    PNG: pngInputRef,
    JPG: jpgInputRef,
    MP4: mp4InputRef,
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCurrentUser(d?.user ?? null))
      .catch(() => {});
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLocalAsset(asset);
    setEditMode(false);
    setConfirmDelete(false);
    setEditForm(null);
    setEditSlots([]);
    setSaveError('');
  }, [asset]);

  if (!localAsset) return null;

  const previewUrl = localAsset.thumbnailUrl ?? localAsset.svgUrl ?? localAsset.pngUrl ?? localAsset.jpgUrl;
  const assetPageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/assets/${localAsset.id}`
    : `/assets/${localAsset.id}`;

  function startEdit() {
    setEditForm({
      name: localAsset!.name,
      description: localAsset!.description ?? '',
      category: localAsset!.category,
      status: localAsset!.status,
      tags: localAsset!.tags.join(', '),
      owner: localAsset!.owner,
      deprecationReason: localAsset!.deprecationReason ?? '',
      backgroundColor: localAsset!.backgroundColor ?? '',
    });
    setEditSlots([
      { format: 'SVG', file: null, previewUrl: null, existingFileId: localAsset!.svgFileId, existingUrl: localAsset!.svgUrl, removed: false },
      { format: 'PNG', file: null, previewUrl: null, existingFileId: localAsset!.pngFileId, existingUrl: localAsset!.pngUrl, removed: false },
      { format: 'JPG', file: null, previewUrl: null, existingFileId: localAsset!.jpgFileId, existingUrl: localAsset!.jpgUrl, removed: false },
    ]);
    setSaveError('');
    setEditMode(true);
    setConfirmDelete(false);
  }

  const handleSlotFile = useCallback((format: AssetFormat, file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const isImg = file.type.startsWith('image/') || ['svg', 'png', 'jpg', 'jpeg'].includes(ext);
    const previewUrl = isImg ? URL.createObjectURL(file) : null;
    setEditSlots((prev) =>
      prev.map((s) => {
        if (s.format !== format) return s;
        if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
        return { ...s, file, previewUrl, removed: false };
      })
    );
  }, []);

  function handleSlotRemoveNew(format: AssetFormat) {
    setEditSlots((prev) =>
      prev.map((s) => {
        if (s.format !== format) return s;
        if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
        return { ...s, file: null, previewUrl: null };
      })
    );
  }

  function handleSlotRemoveExisting(format: AssetFormat) {
    setEditSlots((prev) =>
      prev.map((s) => s.format !== format ? s : { ...s, removed: true, file: null, previewUrl: null })
    );
  }

  function handleSlotRestore(format: AssetFormat) {
    setEditSlots((prev) =>
      prev.map((s) => s.format !== format ? s : { ...s, removed: false })
    );
  }

  async function uploadSlotFile(slot: EditFormatSlot): Promise<string> {
    if (!slot.file) throw new Error('No file');
    const form = new FormData();
    form.append('file', slot.file, slot.file.name);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Failed to upload ${slot.format}`);
    const { fileId } = await res.json();
    return fileId as string;
  }

  async function handleSave() {
    if (!editForm || !localAsset) return;
    setSaving(true);
    setSaveError('');
    try {
      // Resolve each format's fileId: upload new → keep existing → clear if removed
      const slotMap = Object.fromEntries(editSlots.map((s) => [s.format, s])) as Record<AssetFormat, EditFormatSlot>;

      const resolveFileId = async (fmt: AssetFormat, existing: string | undefined): Promise<string> => {
        const s = slotMap[fmt];
        if (s.removed) return '';
        if (s.file) return uploadSlotFile(s);
        return existing ?? '';
      };

      const [svgFileId, pngFileId, jpgFileId] = await Promise.all([
        resolveFileId('SVG', localAsset.svgFileId),
        resolveFileId('PNG', localAsset.pngFileId),
        resolveFileId('JPG', localAsset.jpgFileId),
      ]);

      const formats: AssetFormat[] = [];
      if (svgFileId) formats.push('SVG');
      if (pngFileId) formats.push('PNG');
      if (jpgFileId) formats.push('JPG');

      const body = {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        category: editForm.category.trim(),
        status: editForm.status,
        tags: editForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        owner: editForm.owner.trim(),
        deprecationReason:
          editForm.status === 'Deprecated' ? (editForm.deprecationReason.trim() || undefined) : undefined,
        svgFileId,
        pngFileId,
        jpgFileId,
        formats,
        backgroundColor: editForm.backgroundColor,
      };

      const res = await fetch(`/api/assets/${localAsset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated: Asset = await res.json();
      setLocalAsset(updated);
      setEditMode(false);
      setEditForm(null);
      setEditSlots([]);
      onAssetUpdated?.(updated);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!localAsset) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/assets/${localAsset.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      onAssetDeleted?.(localAsset.id);
      onOpenChange(false);
    } catch {
      setDeleting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) { setEditMode(false); setConfirmDelete(false); }
        onOpenChange(v);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="!max-w-[92vw] w-[1400px] h-[88vh] p-0 overflow-hidden bg-white rounded-2xl shadow-2xl ring-0 flex flex-col gap-0"
      >
        <DialogTitle className="sr-only">{localAsset.name}</DialogTitle>

        {/* DELETE CONFIRMATION OVERLAY */}
        {confirmDelete && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-7 max-w-sm w-full mx-4 text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Delete this asset?</h3>
              <p className="text-sm text-slate-500 mb-6">
                <span className="font-medium text-slate-700">{localAsset.name}</span> will be permanently removed. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TOPBAR */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 h-14 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 overflow-hidden">
            <span className="font-semibold text-slate-900 text-sm truncate">{localAsset.name}</span>
            {localAsset.category && (
              <Badge variant="secondary" className="flex-shrink-0 text-xs bg-blue-50 text-blue-700 border-blue-100 hidden sm:inline-flex">
                {localAsset.category}
              </Badge>
            )}
            {localAsset.formats.map((fmt) => (
              <span
                key={fmt}
                className={`text-xs font-semibold flex-shrink-0 hidden sm:inline px-1.5 py-0.5 rounded border ${FORMAT_COLORS[fmt]}`}
              >
                {fmt}
              </span>
            ))}
            {localAsset.status === 'Deprecated' && (
              <Badge variant="outline" className="flex-shrink-0 text-xs text-red-600 border-red-200 bg-red-50 hidden sm:inline-flex">
                Deprecated
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">

            {/* Download as dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-medium border-0 bg-transparent"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[168px]">
                {localAsset.formats.length === 0 && (
                  <DropdownMenuItem disabled className="text-slate-400 text-sm">
                    No files available
                  </DropdownMenuItem>
                )}
                {localAsset.formats.map((fmt) => {
                  const url = getFormatUrl(localAsset, fmt);
                  return (
                    <DropdownMenuItem
                      key={fmt}
                      onClick={() => url && triggerDownload(url, localAsset.name, fmt)}
                      disabled={!url}
                      className="gap-2.5 cursor-pointer text-sm"
                    >
                      <span className={cn('h-2 w-2 rounded-full flex-shrink-0', FORMAT_DOT[fmt])} />
                      {fmt}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit / Delete — logged-in users only */}
            {currentUser && (
              <>
                <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block" />
                <Tooltip>
                  <TooltipTrigger
                    className={cn(
                      'inline-flex items-center justify-center h-8 w-8 rounded-lg transition-colors cursor-pointer border-0 bg-transparent',
                      editMode
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    )}
                    onClick={startEdit}
                  >
                    <Pencil className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>Edit asset</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent"
                    onClick={() => { setConfirmDelete(true); setEditMode(false); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>Delete asset</TooltipContent>
                </Tooltip>
              </>
            )}

            <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block" />
            <Tooltip>
              <TooltipTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
                <Link href={`/assets/${localAsset.id}`} onClick={() => onOpenChange(false)}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Full page</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* BODY */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Preview */}
          <div
            className="flex-1 min-w-0 flex items-center justify-center relative overflow-hidden"
            style={
              localAsset.backgroundColor
                ? { background: localAsset.backgroundColor }
                : {
                    background: `
                linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
              `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    backgroundColor: '#fafafa',
                  }
            }
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt={localAsset.name}
                fill
                sizes="70vw"
                className="object-contain p-8"
                unoptimized
                priority
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-slate-400">
                <FileImage className="w-20 h-20 text-slate-300" />
                <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                  No preview
                </span>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="w-80 flex-shrink-0 border-l border-slate-100 bg-white flex flex-col overflow-hidden">
            {editMode && editForm ? (
              /* EDIT FORM */
              <form
                onSubmit={(e) => { e.preventDefault(); handleSave(); }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
                  <span className="text-sm font-semibold text-slate-900">Edit asset</span>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="h-7 w-7 rounded-md inline-flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer border-0 bg-transparent"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">

                  {/* FILE SLOTS */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Files</p>
                    <div className="space-y-3">
                      {editSlots.map((slot) => (
                        <div key={slot.format} className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className={`text-xs font-semibold px-1.5 py-0 ${FORMAT_BADGE[slot.format]}`}>
                              {slot.format}
                            </Badge>
                            <span className="text-xs text-slate-400">
                              {slot.format === 'SVG' ? 'Required' : 'Optional'}
                            </span>
                          </div>

                          {slot.removed ? (
                            /* Removed state */
                            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                              <span className="text-xs text-red-500 line-through">Removed</span>
                              <button
                                type="button"
                                onClick={() => handleSlotRestore(slot.format)}
                                className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                              >
                                Restore
                              </button>
                            </div>
                          ) : slot.file ? (
                            /* New file queued */
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
                              {slot.previewUrl ? (
                                <div className="w-8 h-8 flex-shrink-0 rounded overflow-hidden border border-emerald-200 bg-white flex items-center justify-center">
                                  <Image src={slot.previewUrl} alt={slot.format} width={32} height={32} className="w-full h-full object-contain" unoptimized />
                                </div>
                              ) : (
                                <FileImage className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-emerald-800 truncate">{slot.file.name}</p>
                                <p className="text-xs text-emerald-600">{formatFileSize(slot.file.size)}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSlotRemoveNew(slot.format)}
                                className="h-5 w-5 flex-shrink-0 flex items-center justify-center rounded text-emerald-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : slot.existingFileId ? (
                            /* Existing file */
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                              {slot.existingUrl ? (
                                <div className="w-8 h-8 flex-shrink-0 rounded overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                                  <Image src={slot.existingUrl} alt={slot.format} width={32} height={32} className="w-full h-full object-contain" unoptimized />
                                </div>
                              ) : (
                                <FileImage className="h-4 w-4 text-slate-400 flex-shrink-0" />
                              )}
                              <span className="flex-1 text-xs text-slate-600 font-medium">Current file</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => formatRefs[slot.format].current?.click()}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Replace
                                </button>
                                <span className="text-slate-300">·</span>
                                <button
                                  type="button"
                                  onClick={() => handleSlotRemoveExisting(slot.format)}
                                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Empty — drop zone */
                            <div
                              className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-lg p-4 text-center cursor-pointer transition-colors hover:bg-slate-50"
                              onClick={() => formatRefs[slot.format].current?.click()}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => e.key === 'Enter' && formatRefs[slot.format].current?.click()}
                            >
                              <CloudUpload className="h-5 w-5 text-slate-300 mx-auto mb-1" />
                              <p className="text-xs text-slate-400">
                                Drop {slot.format} or <span className="text-blue-600 font-medium">browse</span>
                              </p>
                            </div>
                          )}

                          <input
                            ref={formatRefs[slot.format] as React.RefObject<HTMLInputElement>}
                            type="file"
                            accept={FORMAT_ACCEPT[slot.format]}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleSlotFile(slot.format, file);
                              e.target.value = '';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* METADATA FIELDS */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Name
                      </Label>
                      <Input
                        id="edit-name"
                        value={editForm.name}
                        onChange={(e) => setEditForm((f) => f ? { ...f, name: e.target.value } : f)}
                        className="h-9 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-description" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Description
                      </Label>
                      <Textarea
                        id="edit-description"
                        value={editForm.description}
                        onChange={(e) => setEditForm((f) => f ? { ...f, description: e.target.value } : f)}
                        className="text-sm resize-none"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Category
                      </Label>
                      <CategoryPicker
                        categories={categories}
                        value={editForm.category}
                        onChange={(v) => setEditForm((f) => f ? { ...f, category: v } : f)}
                        onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat])}
                        className="h-9 text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Status
                      </Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(v) => setEditForm((f) => f ? { ...f, status: v as AssetStatus } : f)}
                      >
                        <SelectTrigger className="h-9 text-sm w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Deprecated">Deprecated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {editForm.status === 'Deprecated' && (
                      <div>
                        <Label htmlFor="edit-dep-reason" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                          Deprecation reason
                        </Label>
                        <Textarea
                          id="edit-dep-reason"
                          value={editForm.deprecationReason}
                          onChange={(e) => setEditForm((f) => f ? { ...f, deprecationReason: e.target.value } : f)}
                          className="text-sm resize-none"
                          rows={2}
                          placeholder="Why is this deprecated?"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="edit-owner" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Owner
                      </Label>
                      <Input
                        id="edit-owner"
                        value={editForm.owner}
                        onChange={(e) => setEditForm((f) => f ? { ...f, owner: e.target.value } : f)}
                        className="h-9 text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-tags" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Tags
                      </Label>
                      <Input
                        id="edit-tags"
                        value={editForm.tags}
                        onChange={(e) => setEditForm((f) => f ? { ...f, tags: e.target.value } : f)}
                        className="h-9 text-sm"
                        placeholder="logo, icon, brand"
                      />
                      <p className="text-xs text-slate-400 mt-1">Separate tags with commas</p>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Background Color
                      </Label>
                      <BackgroundColorPicker
                        value={editForm.backgroundColor}
                        onChange={(v) => setEditForm((f) => f ? { ...f, backgroundColor: v } : f)}
                      />
                      <p className="text-xs text-slate-400 mt-1">Useful for light or white logos</p>
                    </div>
                  </div>

                  {saveError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                      {saveError}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 p-4 flex gap-2 flex-shrink-0">
                  <Button
                    type="submit"
                    size="sm"
                    className="flex-1 bg-[#4E86F7] hover:bg-[#3a72e3] text-white"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Saving…
                      </>
                    ) : 'Save changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              /* METADATA PANEL */
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Name + status */}
                <div>
                  <h2 className="font-semibold text-slate-900 text-base leading-snug mb-2">{localAsset.name}</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={localAsset.status} />
                    {localAsset.category && (
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-100">
                        {localAsset.category}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Description */}
                {localAsset.description && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{localAsset.description}</p>
                  </div>
                )}

                {/* Deprecation */}
                {localAsset.status === 'Deprecated' && localAsset.deprecationReason && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <TrendingDown className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-700 mb-0.5">Reason</p>
                      <p className="text-xs text-red-600">{localAsset.deprecationReason}</p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {localAsset.tags.length > 0 && (
                  <div>
                    <p className="flex items-center gap-1 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      <Tag className="h-3 w-3" /> Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {localAsset.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
                          onClick={() => { onOpenChange(false); window.location.href = `/?search=${encodeURIComponent(tag)}`; }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-3 text-sm">
                  {localAsset.owner && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1"><User className="h-3 w-3" />Owner</p>
                      <p className="font-medium text-slate-800 text-xs truncate">{localAsset.owner}</p>
                    </div>
                  )}
                  {localAsset.downloadCount > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Downloads</p>
                      <p className="font-medium text-slate-800 text-xs">{localAsset.downloadCount.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Download per format */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Download</p>
                  {localAsset.formats.map((fmt) => {
                    const url = getFormatUrl(localAsset, fmt);
                    return (
                      <button
                        key={fmt}
                        onClick={() => url && triggerDownload(url, localAsset.name, fmt)}
                        disabled={!url}
                        className={cn(
                          'flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg border font-medium transition-colors justify-center',
                          url ? FORMAT_COLORS[fmt] : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
                        )}
                      >
                        <Download className="h-4 w-4" />
                        Download {fmt}
                      </button>
                    );
                  })}
                  {localAsset.formats.length === 0 && (
                    <div className="flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg bg-slate-100 text-slate-400 justify-center">
                      <Download className="h-4 w-4" />
                      No files attached
                    </div>
                  )}
                  <CopyLinkButton value={assetPageUrl} />
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
