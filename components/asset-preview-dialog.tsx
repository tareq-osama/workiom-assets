'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Download, ExternalLink, FileImage, Link2, Check, TrendingDown, Tag, User,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import StatusBadge from '@/components/status-badge';
import CollectionsPopover from '@/components/collections-popover';
import type { Asset, AssetFormat } from '@/types/asset';
import { cn } from '@/lib/utils';

interface AssetPreviewDialogProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getFormatUrl(asset: Asset, format: AssetFormat): string | undefined {
  if (format === 'SVG') return asset.svgUrl;
  if (format === 'PNG') return asset.pngUrl;
  if (format === 'JPG') return asset.jpgUrl;
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

export default function AssetPreviewDialog({ asset, open, onOpenChange }: AssetPreviewDialogProps) {
  if (!asset) return null;

  const previewUrl = asset.thumbnailUrl ?? asset.svgUrl ?? asset.pngUrl ?? asset.jpgUrl;
  const assetPageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/assets/${asset.id}`
    : `/assets/${asset.id}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[92vw] w-[1400px] h-[88vh] p-0 overflow-hidden bg-white rounded-2xl shadow-2xl ring-0 flex flex-col gap-0"
      >
        <DialogTitle className="sr-only">{asset.name}</DialogTitle>

        {/* TOPBAR */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 h-14 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 overflow-hidden">
            <span className="font-semibold text-slate-900 text-sm truncate">{asset.name}</span>
            {asset.category && (
              <Badge variant="secondary" className="flex-shrink-0 text-xs bg-blue-50 text-blue-700 border-blue-100 hidden sm:inline-flex">
                {asset.category}
              </Badge>
            )}
            {asset.formats.map((fmt) => (
              <span
                key={fmt}
                className={`text-xs font-semibold flex-shrink-0 hidden sm:inline px-1.5 py-0.5 rounded border ${FORMAT_COLORS[fmt]}`}
              >
                {fmt}
              </span>
            ))}
            {asset.status === 'Deprecated' && (
              <Badge variant="outline" className="flex-shrink-0 text-xs text-red-600 border-red-200 bg-red-50 hidden sm:inline-flex">
                Deprecated
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <CollectionsPopover asset={asset} />
            <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block" />
            <Tooltip>
              <TooltipTrigger
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => {
                  const url = asset.svgUrl ?? asset.pngUrl ?? asset.jpgUrl;
                  const fmt = asset.formats[0];
                  if (url && fmt) triggerDownload(url, asset.name, fmt);
                }}
              >
                <Download className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Download primary</TooltipContent>
            </Tooltip>
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

        {/* BODY */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Preview */}
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
                <FileImage className="w-20 h-20 text-slate-300" />
                <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                  No preview
                </span>
              </div>
            )}
          </div>

          {/* Details panel */}
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
              <div className="grid grid-cols-2 gap-y-3 gap-x-3 text-sm">
                {asset.owner && (
                  <div className="col-span-2">
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

              {/* Download per format */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Download</p>
                {asset.formats.map((fmt) => {
                  const url = getFormatUrl(asset, fmt);
                  return (
                    <button
                      key={fmt}
                      onClick={() => url && triggerDownload(url, asset.name, fmt)}
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
                {asset.formats.length === 0 && (
                  <div className="flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg bg-slate-100 text-slate-400 justify-center">
                    <Download className="h-4 w-4" />
                    No files attached
                  </div>
                )}
                <CopyLinkButton value={assetPageUrl} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
