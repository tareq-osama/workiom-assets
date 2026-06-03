'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Download, ExternalLink, File, FileImage, FileSpreadsheet,
  FileText, Film, Link2, ImageIcon, Code, Check, TrendingDown, Tag, User, HardDrive,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import StatusBadge from '@/components/status-badge';
import CollectionsPopover from '@/components/collections-popover';
import type { Asset } from '@/types/asset';
import { cn } from '@/lib/utils';

interface AssetPreviewDialogProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function FileTypeIcon({ fileType, className }: { fileType: string; className?: string }) {
  const t = fileType.toUpperCase();
  if (['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP', 'SVG'].includes(t)) return <FileImage className={className} />;
  if (['MP4', 'MOV', 'AVI', 'WEBM'].includes(t)) return <Film className={className} />;
  if (['PDF', 'DOC', 'DOCX'].includes(t)) return <FileText className={className} />;
  if (['XLS', 'XLSX', 'CSV'].includes(t)) return <FileSpreadsheet className={className} />;
  return <File className={className} />;
}

function isImage(ft: string) {
  return ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP', 'SVG'].includes(ft.toUpperCase());
}

function formatSize(bytes: number) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function triggerDownload(asset: Asset) {
  try {
    const res = await fetch(asset.fileUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.name}.${asset.fileType.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch {
    window.open(asset.fileUrl, '_blank');
  }
}

function CopyIconButton({ value, icon, tooltip, label }: {
  value: string; icon: React.ReactNode; tooltip: string; label?: string;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(value); } catch { return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  if (label) {
    return (
      <button
        onClick={copy}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors',
          copied && 'border-emerald-200 text-emerald-700 bg-emerald-50'
        )}
      >
        {copied ? <Check className="h-4 w-4" /> : icon}
        {copied ? 'Copied!' : label}
      </button>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          'inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer',
          copied && 'text-emerald-600 bg-emerald-50'
        )}
        onClick={copy}
      >
        {copied ? <Check className="h-4 w-4" /> : icon}
      </TooltipTrigger>
      <TooltipContent>{copied ? 'Copied!' : tooltip}</TooltipContent>
    </Tooltip>
  );
}

export default function AssetPreviewDialog({ asset, open, onOpenChange }: AssetPreviewDialogProps) {
  if (!asset) return null;

  const previewUrl = asset.thumbnailUrl || (isImage(asset.fileType) ? asset.fileUrl : null);
  const isSvg = asset.fileType.toUpperCase() === 'SVG';
  const size = formatSize(asset.fileSize);
  const assetPageUrl = typeof window !== 'undefined' ? `${window.location.origin}/assets/${asset.id}` : `/assets/${asset.id}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[92vw] w-[1400px] h-[88vh] p-0 overflow-hidden bg-white rounded-2xl shadow-2xl ring-0 flex flex-col gap-0"
      >
        <DialogTitle className="sr-only">{asset.name}</DialogTitle>

        {/* ── TOPBAR ── */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 h-14 border-b border-slate-100 bg-white">
          {/* Name + chips */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0 overflow-hidden">
            <span className="font-semibold text-slate-900 text-sm truncate">{asset.name}</span>
            {asset.category && (
              <Badge variant="secondary" className="flex-shrink-0 text-xs bg-blue-50 text-blue-700 border-blue-100 hidden sm:inline-flex">
                {asset.category}
              </Badge>
            )}
            {asset.fileType && (
              <span className="text-xs font-medium text-slate-400 flex-shrink-0 hidden sm:inline bg-slate-100 px-1.5 py-0.5 rounded">
                {asset.fileType}
              </span>
            )}
            {size && <span className="text-xs text-slate-400 flex-shrink-0 hidden md:inline">{size}</span>}
            {asset.status === 'Deprecated' && (
              <Badge variant="outline" className="flex-shrink-0 text-xs text-red-600 border-red-200 bg-red-50 hidden sm:inline-flex">
                Deprecated
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <CollectionsPopover asset={asset} />
            <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block" />
            <Tooltip>
              <TooltipTrigger
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => asset.fileUrl && triggerDownload(asset)}
              >
                <Download className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
            <CopyIconButton value={assetPageUrl} icon={<Link2 className="h-4 w-4" />} tooltip="Copy Link" />
            {isImage(asset.fileType) && asset.fileUrl && (
              <CopyIconButton value={asset.fileUrl} icon={<ImageIcon className="h-4 w-4" />} tooltip="Copy File URL" />
            )}
            {isSvg && asset.fileUrl && (
              <CopyIconButton value={asset.fileUrl} icon={<Code className="h-4 w-4" />} tooltip="Copy as SVG" />
            )}
            <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block" />
            <Tooltip>
              <TooltipTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
                <Link href={`/assets/${asset.id}`} onClick={() => onOpenChange(false)}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Full page</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* ── BODY: preview left + details right ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Left — preview on light checkerboard bg */}
          <div
            className="flex-1 min-w-0 flex items-center justify-center relative overflow-hidden"
            style={{
              background: `
                linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              backgroundColor: '#fafafa',
            }}
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt={asset.name}
                fill
                sizes="70vw"
                className="object-contain p-8"
                unoptimized
                priority
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-slate-400">
                <FileTypeIcon fileType={asset.fileType} className="w-20 h-20 text-slate-300" />
                <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                  {asset.fileType || 'No preview'}
                </span>
              </div>
            )}
          </div>

          {/* Right — details panel */}
          <div className="w-80 flex-shrink-0 border-l border-slate-100 bg-white flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* Name + status */}
              <div>
                <h2 className="font-semibold text-slate-900 text-base leading-snug mb-2">{asset.name}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={asset.status} />
                  {asset.category && (
                    <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-100">
                      {asset.category}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              {asset.description && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{asset.description}</p>
                </div>
              )}

              {/* Deprecation */}
              {asset.status === 'Deprecated' && asset.deprecationReason && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <TrendingDown className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-0.5">Reason</p>
                    <p className="text-xs text-red-600">{asset.deprecationReason}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {asset.tags.length > 0 && (
                <div>
                  <p className="flex items-center gap-1 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <Tag className="h-3 w-3" /> Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {asset.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
                        onClick={() => { onOpenChange(false); window.location.href = `/browse?search=${encodeURIComponent(tag)}`; }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-sm">
                {asset.fileType && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Type</p>
                    <p className="font-medium text-slate-800 text-xs">{asset.fileType}</p>
                  </div>
                )}
                {size && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1"><HardDrive className="h-3 w-3" />Size</p>
                    <p className="font-medium text-slate-800 text-xs">{size}</p>
                  </div>
                )}
                {asset.owner && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1"><User className="h-3 w-3" />Owner</p>
                    <p className="font-medium text-slate-800 text-xs truncate">{asset.owner}</p>
                  </div>
                )}
                {asset.downloadCount > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Downloads</p>
                    <p className="font-medium text-slate-800 text-xs">{asset.downloadCount.toLocaleString()}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Download action */}
              <div className="space-y-2">
                {asset.fileUrl ? (
                  <button
                    onClick={() => triggerDownload(asset)}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg bg-[#4E86F7] hover:bg-[#3a72e3] text-white transition-colors font-medium justify-center"
                  >
                    <Download className="h-4 w-4" />
                    Download {asset.fileType}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg bg-slate-100 text-slate-400 justify-center">
                    <Download className="h-4 w-4" />
                    No file attached
                  </div>
                )}
                <CopyIconButton value={assetPageUrl} icon={<Link2 className="h-4 w-4" />} tooltip="Copy Link" label="Copy Link" />
                {isImage(asset.fileType) && asset.fileUrl && (
                  <CopyIconButton value={asset.fileUrl} icon={<ImageIcon className="h-4 w-4" />} tooltip="Copy File URL" label="Copy File URL" />
                )}
                {isSvg && asset.fileUrl && (
                  <CopyIconButton value={asset.fileUrl} icon={<Code className="h-4 w-4" />} tooltip="Copy as SVG" label="Copy as SVG" />
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
