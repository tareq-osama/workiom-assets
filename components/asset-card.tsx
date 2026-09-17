'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Link2, FileImage, ExternalLink, Pencil, Type, Copy, Trash2, Loader2, Play, AlertTriangle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/status-badge';
import AssetPreviewDialog from '@/components/asset-preview-dialog';
import type { Asset, AssetFormat } from '@/types/asset';
import { cn } from '@/lib/utils';

interface AssetCardProps {
  asset: Asset;
  viewMode?: 'grid' | 'list';
  isAuthenticated?: boolean;
}

function isImageFormat(fmt: string) {
  return ['SVG', 'PNG', 'JPG', 'JPEG'].includes(fmt.toUpperCase());
}

const DOCUMENT_FORMATS = ['PDF', 'DOC', 'XLS', 'PPT'];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFormatUrl(asset: Asset, format: AssetFormat): string | undefined {
  if (format === 'SVG') return asset.svgUrl;
  if (format === 'PNG') return asset.pngUrl;
  if (format === 'JPG') return asset.jpgUrl;
}

async function downloadFormat(asset: Asset, format: AssetFormat, e: React.MouseEvent) {
  e.stopPropagation();
  const url = getFormatUrl(asset, format);
  if (!url) return;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${asset.name}.${format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  } catch {
    window.open(url, '_blank');
  }
}

function handleCopyLink(asset: Asset, e: React.MouseEvent) {
  e.stopPropagation();
  const url = `${window.location.origin}/assets/${asset.id}`;
  navigator.clipboard.writeText(url).catch(() => {});
}

const FORMAT_COLORS: Record<AssetFormat, string> = {
  SVG: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
  PNG: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  JPG: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  MP4: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
  PDF: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  DOC: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
  XLS: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
  PPT: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
};

const iconBtnBase =
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer border-0 p-0 bg-transparent';

const menuItemCls =
  'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left';

export default function AssetCard({ asset, viewMode = 'grid', isAuthenticated = false }: AssetCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(asset);
  const [isDeleted, setIsDeleted] = useState(false);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('click', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [contextMenu]);

  const previewUrl = imgError
    ? undefined
    : (currentAsset.thumbnailUrl ?? (currentAsset.formats.some(isImageFormat) ? currentAsset.fileUrl : undefined));
  const primaryFormat = currentAsset.formats[0];
  const isLinkAsset = Boolean(currentAsset.linkUrl);
  const isVideoAsset = currentAsset.formats.includes('MP4');
  const isDocumentAsset = currentAsset.formats.some((f) => DOCUMENT_FORMATS.includes(f));
  const LinkIcon = isVideoAsset ? Play : isDocumentAsset ? FileText : ExternalLink;
  const linkActionLabel = isVideoAsset ? 'Play' : isDocumentAsset ? 'Open' : 'Visit';
  const linkKindLabel = isVideoAsset ? 'Video' : isDocumentAsset ? 'Document' : 'Link';

  if (isDeleted) return null;

  function openContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    const x = Math.min(e.clientX, window.innerWidth - 192);
    const y = Math.min(e.clientY, window.innerHeight - 180);
    setContextMenu({ x, y });
  }

  function openEdit() {
    setContextMenu(null);
    if (isLinkAsset) {
      setEditName(currentAsset.name);
      setEditUrl(currentAsset.linkUrl ?? '');
      setEditOpen(true);
    } else {
      setDialogOpen(true);
    }
  }

  function openRename() {
    setContextMenu(null);
    setRenameValue(currentAsset.name);
    setRenameOpen(true);
  }

  async function handleRename() {
    if (!renameValue.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/assets/${currentAsset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      if (res.ok) setCurrentAsset(await res.json());
    } finally {
      setBusy(false);
      setRenameOpen(false);
    }
  }

  async function handleEditSave() {
    if (!editName.trim()) return;
    setBusy(true);
    try {
      const body: Record<string, unknown> = { name: editName.trim() };
      if (isLinkAsset) body.description = `[LINK]${editUrl.trim()}`;
      const res = await fetch(`/api/assets/${currentAsset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) setCurrentAsset(await res.json());
    } finally {
      setBusy(false);
      setEditOpen(false);
    }
  }

  async function handleDuplicate() {
    setContextMenu(null);
    setBusy(true);
    try {
      await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Copy of ${currentAsset.name}`,
          description: currentAsset.linkUrl
            ? `[LINK]${currentAsset.linkUrl}`
            : (currentAsset.description ?? ''),
          category: currentAsset.category,
          tags: currentAsset.tags,
          status: currentAsset.status,
          owner: currentAsset.owner,
          formats: currentAsset.formats,
          fileSize: currentAsset.fileSize,
          svgFileId: currentAsset.svgFileId,
          pngFileId: currentAsset.pngFileId,
          jpgFileId: currentAsset.jpgFileId,
          thumbnailFileId: currentAsset.thumbnailFileId,
        }),
      });
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  function openDeleteConfirm() {
    setContextMenu(null);
    setDeleteConfirmOpen(true);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/assets/${currentAsset.id}`, { method: 'DELETE' });
      if (res.ok) setIsDeleted(true);
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  }

  const ContextMenuPopup = contextMenu ? (
    <div
      className="fixed z-[9999] bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 w-48 select-none"
      style={{ top: contextMenu.y, left: contextMenu.x }}
      onClick={(e) => e.stopPropagation()}
    >
      <button className={menuItemCls} onClick={openEdit}>
        <Pencil className="h-3.5 w-3.5 text-slate-400" />
        Edit
      </button>
      <button className={menuItemCls} onClick={openRename}>
        <Type className="h-3.5 w-3.5 text-slate-400" />
        Rename
      </button>
      <button className={menuItemCls} onClick={handleDuplicate}>
        <Copy className="h-3.5 w-3.5 text-slate-400" />
        Duplicate
      </button>
      <div className="my-1 border-t border-slate-100" />
      <button className={cn(menuItemCls, 'text-red-600 hover:bg-red-50')} onClick={openDeleteConfirm}>
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  ) : null;

  const Modals = (
    <>
      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent showCloseButton={false} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
            className="h-10"
          />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" className="h-9" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={handleRename}
              disabled={busy || !renameValue.trim()}
              className="h-9 bg-[#4E86F7] hover:bg-[#3a72e3] text-white"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Rename'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit link asset dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent showCloseButton={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Link Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">External URL</Label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  type="url"
                  placeholder="https://"
                  className="h-10 pl-9"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" className="h-9" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={handleEditSave}
              disabled={busy || !editName.trim()}
              className="h-9 bg-[#4E86F7] hover:bg-[#3a72e3] text-white"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent showCloseButton={false} className="max-w-sm">
          <div className="flex flex-col items-center text-center pt-2">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogHeader>
              <DialogTitle>Delete this asset?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-500 mt-1 mb-2">
              <span className="font-medium text-slate-700">{currentAsset.name}</span> will be permanently removed. This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="sm:justify-center">
            <DialogClose render={<Button variant="outline" className="h-9 flex-1" disabled={deleting} />}>
              Cancel
            </DialogClose>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="h-9 flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  // ── List view ────────────────────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <>
        {ContextMenuPopup}
        {Modals}
        <div
          className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow group cursor-pointer"
          onClick={() => isLinkAsset ? window.open(currentAsset.linkUrl, '_blank', 'noopener,noreferrer') : setDialogOpen(true)}
          onContextMenu={openContextMenu}
        >
          {/* Thumbnail */}
          <div
            className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center relative"
            style={currentAsset.backgroundColor ? { background: currentAsset.backgroundColor } : undefined}
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt={currentAsset.name}
                width={64}
                height={64}
                className={isLinkAsset ? 'w-full h-full object-cover' : 'w-full h-full object-contain'}
                unoptimized
                onError={() => setImgError(true)}
              />
            ) : (
              <FileImage className="w-8 h-8 text-slate-300" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 truncate">{currentAsset.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-slate-500">{currentAsset.category}</span>
              {isLinkAsset ? (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-blue-600 font-medium flex items-center gap-0.5">
                    <LinkIcon className="w-3 h-3" />
                    {linkKindLabel}
                  </span>
                </>
              ) : currentAsset.formats.length > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <div className="flex gap-1">
                    {currentAsset.formats.map((fmt) => (
                      <Badge
                        key={fmt}
                        variant="outline"
                        className={`text-xs px-1.5 py-0 h-4 leading-none ${FORMAT_COLORS[fmt]}`}
                      >
                        {fmt}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
              {!isLinkAsset && currentAsset.fileSize > 0 && (
                <span className="text-xs text-slate-400">{formatFileSize(currentAsset.fileSize)}</span>
              )}
            </div>
          </div>

          {/* Status */}
          <StatusBadge status={currentAsset.status} />

          {/* Quick actions */}
          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {isLinkAsset ? (
              <Tooltip>
                <TooltipTrigger
                  className={cn(iconBtnBase, 'h-7 px-2 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100')}
                  onClick={() => window.open(currentAsset.linkUrl, '_blank', 'noopener,noreferrer')}
                >
                  <LinkIcon className="h-3 w-3 mr-1" />
                  {linkActionLabel}
                </TooltipTrigger>
                <TooltipContent>{isVideoAsset ? 'Play video' : isDocumentAsset ? 'Open document' : 'Open link'}</TooltipContent>
              </Tooltip>
            ) : (
              currentAsset.formats.map((fmt) => (
                <Tooltip key={fmt}>
                  <TooltipTrigger
                    className={cn(iconBtnBase, 'h-7 px-2 text-xs font-semibold rounded-md', FORMAT_COLORS[fmt])}
                    onClick={(e) => downloadFormat(currentAsset, fmt, e)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    {fmt}
                  </TooltipTrigger>
                  <TooltipContent>Download {fmt}</TooltipContent>
                </Tooltip>
              ))
            )}
            <Tooltip>
              <TooltipTrigger
                className={cn(iconBtnBase, 'h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100')}
                onClick={(e) => handleCopyLink(currentAsset, e)}
              >
                <Link2 className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Copy Link</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {!isLinkAsset && (
          <AssetPreviewDialog
            asset={currentAsset}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onAssetUpdated={(updated) => setCurrentAsset(updated)}
            onAssetDeleted={() => setIsDeleted(true)}
          />
        )}
      </>
    );
  }

  // ── Grid view ────────────────────────────────────────────────────────────────
  return (
    <>
      {ContextMenuPopup}
      {Modals}
      <div
        className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200 cursor-pointer"
        onClick={() => isLinkAsset ? window.open(currentAsset.linkUrl, '_blank', 'noopener,noreferrer') : setDialogOpen(true)}
        onContextMenu={openContextMenu}
      >
        {/* Thumbnail area */}
        <div
          className="relative aspect-video bg-slate-50 border-b border-slate-100 flex items-center justify-center overflow-hidden"
          style={currentAsset.backgroundColor ? { background: currentAsset.backgroundColor } : undefined}
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={currentAsset.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={isLinkAsset ? 'object-cover' : 'object-contain p-4'}
              unoptimized
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-300">
              <FileImage className="w-12 h-12" />
              {primaryFormat && (
                <span className="text-xs font-medium uppercase tracking-wide">{primaryFormat}</span>
              )}
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
            {isLinkAsset ? (
              <span className="h-9 px-4 text-xs font-semibold rounded-md flex items-center gap-1.5 bg-white text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
                <LinkIcon className="h-3.5 w-3.5" />
                {isVideoAsset ? 'Play Video' : isDocumentAsset ? 'Open Document' : 'Visit Link'}
              </span>
            ) : (
              <>
                {currentAsset.formats.map((fmt) => (
                  <Tooltip key={fmt}>
                    <TooltipTrigger
                      className={cn(
                        'h-9 px-3 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer',
                        FORMAT_COLORS[fmt]
                      )}
                      onClick={(e) => downloadFormat(currentAsset, fmt, e)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      {fmt}
                    </TooltipTrigger>
                    <TooltipContent>Download {fmt}</TooltipContent>
                  </Tooltip>
                ))}
                <Tooltip>
                  <TooltipTrigger
                    className={cn(iconBtnBase, 'h-9 w-9 bg-white text-slate-900 hover:bg-slate-100 rounded-md')}
                    onClick={(e) => handleCopyLink(currentAsset, e)}
                  >
                    <Link2 className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>Copy Link</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>

        {/* Card footer */}
        <div className="p-3">
          <h3 className="font-medium text-sm text-slate-900 truncate leading-snug mb-1.5">
            {currentAsset.name}
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 truncate flex-1 min-w-0">{currentAsset.category}</span>
            {!isLinkAsset && currentAsset.formats.map((fmt) => (
              <Badge
                key={fmt}
                variant="outline"
                className={`text-xs px-1.5 py-0 h-4 leading-none flex-shrink-0 ${FORMAT_COLORS[fmt]}`}
              >
                {fmt}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {!isLinkAsset && (
        <AssetPreviewDialog
          asset={currentAsset}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onAssetUpdated={(updated) => setCurrentAsset(updated)}
          onAssetDeleted={() => setIsDeleted(true)}
        />
      )}
    </>
  );
}
