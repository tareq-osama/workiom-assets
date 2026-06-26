'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, Link2, FileImage, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import StatusBadge from '@/components/status-badge';
import AssetPreviewDialog from '@/components/asset-preview-dialog';
import type { Asset, AssetFormat } from '@/types/asset';
import { cn } from '@/lib/utils';

interface AssetCardProps {
  asset: Asset;
  viewMode?: 'grid' | 'list';
}

function isImageFormat(fmt: string) {
  return ['SVG', 'PNG', 'JPG', 'JPEG'].includes(fmt.toUpperCase());
}

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
};

const iconBtnBase =
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer border-0 p-0 bg-transparent';

export default function AssetCard({ asset, viewMode = 'grid' }: AssetCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(asset);
  const [isDeleted, setIsDeleted] = useState(false);

  const previewUrl = imgError
    ? undefined
    : (currentAsset.thumbnailUrl ?? (currentAsset.formats.some(isImageFormat) ? currentAsset.fileUrl : undefined));
  const primaryFormat = currentAsset.formats[0];
  const isLinkAsset = Boolean(currentAsset.linkUrl);

  if (isDeleted) return null;

  if (viewMode === 'list') {
    return (
      <>
        <div
          className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow group cursor-pointer"
          onClick={() => isLinkAsset ? window.open(currentAsset.linkUrl, '_blank', 'noopener,noreferrer') : setDialogOpen(true)}
        >
          {/* Thumbnail */}
          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center relative">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt={currentAsset.name}
                width={64}
                height={64}
                className="w-full h-full object-contain"
                unoptimized
                onError={() => setImgError(true)}
              />
            ) : (
              <FileImage className="w-8 h-8 text-slate-300" />
            )}
            {isLinkAsset && (
              <div className="absolute bottom-0.5 right-0.5 bg-blue-500 rounded-full p-0.5">
                <ExternalLink className="w-2.5 h-2.5 text-white" />
              </div>
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
                    <ExternalLink className="w-3 h-3" /> Link
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
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Visit
                </TooltipTrigger>
                <TooltipContent>Open link</TooltipContent>
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

  // Grid view
  return (
    <>
      <div
        className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200 cursor-pointer"
        onClick={() => isLinkAsset ? window.open(currentAsset.linkUrl, '_blank', 'noopener,noreferrer') : setDialogOpen(true)}
      >
        {/* Thumbnail area */}
        <div className="relative aspect-video bg-slate-50 border-b border-slate-100 flex items-center justify-center overflow-hidden">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={currentAsset.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
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
                <ExternalLink className="h-3.5 w-3.5" />
                Visit Link
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
