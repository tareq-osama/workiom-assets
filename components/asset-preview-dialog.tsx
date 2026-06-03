'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Download,
  ExternalLink,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Film,
  Link2,
  ImageIcon,
  Code,
  Check,
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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

function CopyIconButton({ value, icon, tooltip }: { value: string; icon: React.ReactNode; tooltip: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(value); } catch { return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <Tooltip>
      <TooltipTrigger
        className={cn('inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer', copied && 'text-emerald-600')}
        onClick={copy}
      >
        {copied ? <Check className="h-4 w-4" /> : icon}
      </TooltipTrigger>
      <TooltipContent>{copied ? 'Copied!' : tooltip}</TooltipContent>
    </Tooltip>
  );
}

export default function AssetPreviewDialog({ asset, open, onOpenChange }: AssetPreviewDialogProps) {
  const [infoExpanded, setInfoExpanded] = useState(false);

  if (!asset) return null;

  const previewUrl = asset.thumbnailUrl || (isImage(asset.fileType) ? asset.fileUrl : null);
  const isSvg = asset.fileType.toUpperCase() === 'SVG';
  const size = formatSize(asset.fileSize);
  const assetPageUrl = typeof window !== 'undefined' ? `${window.location.origin}/assets/${asset.id}` : `/assets/${asset.id}`;
  const hasInfo = asset.description || asset.tags.length > 0 || (asset.status === 'Deprecated' && asset.deprecationReason);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] w-[1200px] h-[92vh] p-0 overflow-hidden bg-white rounded-2xl flex flex-col gap-0 shadow-2xl">
        <DialogTitle className="sr-only">{asset.name}</DialogTitle>

        {/* ── TOPBAR ── */}
        <div className="h-14 flex-shrink-0 flex items-center gap-2 px-3 border-b border-slate-100 bg-white">

          {/* Left: name + meta chips */}
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <h2 className="font-semibold text-slate-900 text-sm truncate max-w-[180px] sm:max-w-xs">
              {asset.name}
            </h2>
            {asset.category && (
              <Badge variant="secondary" className="flex-shrink-0 text-xs bg-blue-50 text-blue-700 border-blue-100 hidden sm:inline-flex">
                {asset.category}
              </Badge>
            )}
            {asset.fileType && (
              <span className="text-xs text-slate-400 flex-shrink-0 hidden sm:inline">{asset.fileType}</span>
            )}
            {size && (
              <span className="text-xs text-slate-400 flex-shrink-0 hidden md:inline">{size}</span>
            )}
            {asset.owner && (
              <span className="text-xs text-slate-400 flex-shrink-0 hidden lg:inline">by {asset.owner}</span>
            )}
            {/* Tags – overflow hidden */}
            {asset.tags.length > 0 && (
              <div className="hidden xl:flex items-center gap-1 overflow-hidden">
                {asset.tags.slice(0, 4).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-slate-100 text-slate-500 flex-shrink-0 cursor-pointer hover:bg-slate-200"
                    onClick={() => { onOpenChange(false); window.location.href = `/browse?search=${encodeURIComponent(tag)}`; }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {/* Collections */}
            <CollectionsPopover asset={asset} />

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* Download */}
            <Tooltip>
              <TooltipTrigger
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
                onClick={() => asset.fileUrl && triggerDownload(asset)}
              >
                <Download className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Download {asset.fileType}</TooltipContent>
            </Tooltip>

            {/* Copy link */}
            <CopyIconButton value={assetPageUrl} icon={<Link2 className="h-4 w-4" />} tooltip="Copy Link" />

            {/* Copy file URL (images only) */}
            {isImage(asset.fileType) && asset.fileUrl && (
              <CopyIconButton value={asset.fileUrl} icon={<ImageIcon className="h-4 w-4" />} tooltip="Copy File URL" />
            )}

            {/* Copy SVG */}
            {isSvg && asset.fileUrl && (
              <CopyIconButton value={asset.fileUrl} icon={<Code className="h-4 w-4" />} tooltip="Copy as SVG" />
            )}

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* Open full page */}
            <Tooltip>
              <TooltipTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
                <Link href={`/assets/${asset.id}`} onClick={() => onOpenChange(false)}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Open full page</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* ── PREVIEW (fills remaining space) ── */}
        <div className="flex-1 min-h-0 relative bg-slate-900 flex items-center justify-center overflow-hidden">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={asset.name}
              fill
              sizes="96vw"
              className="object-contain"
              unoptimized
              priority
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-slate-600">
              <FileTypeIcon fileType={asset.fileType} className="w-24 h-24 text-slate-600" />
              <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                {asset.fileType || 'No preview'}
              </p>
            </div>
          )}

          {/* Deprecated banner */}
          {asset.status === 'Deprecated' && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
              <TrendingDown className="h-3 w-3" />
              Deprecated
            </div>
          )}

          {/* Bottom info overlay — expandable */}
          {hasInfo && (
            <div className={cn(
              'absolute bottom-0 left-0 right-0 transition-all duration-300',
              infoExpanded ? 'bg-black/80 backdrop-blur-sm' : 'bg-gradient-to-t from-black/70 via-black/30 to-transparent'
            )}>
              {/* Toggle row */}
              <button
                className="w-full flex items-center justify-between px-5 py-3 text-white/80 hover:text-white transition-colors"
                onClick={() => setInfoExpanded((v) => !v)}
              >
                <span className="text-xs font-medium">
                  {infoExpanded ? 'Hide details' : 'Show details'}
                </span>
                {infoExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>

              {/* Expanded content */}
              {infoExpanded && (
                <div className="px-5 pb-5 space-y-3">
                  {asset.description && (
                    <p className="text-sm text-white/90 leading-relaxed">{asset.description}</p>
                  )}
                  {asset.status === 'Deprecated' && asset.deprecationReason && (
                    <div className="flex items-start gap-2 bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                      <TrendingDown className="h-4 w-4 text-red-300 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-200">{asset.deprecationReason}</p>
                    </div>
                  )}
                  {asset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {asset.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-white/10 text-white border-white/20 hover:bg-white/20 cursor-pointer"
                          onClick={() => { onOpenChange(false); window.location.href = `/browse?search=${encodeURIComponent(tag)}`; }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
