'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Download,
  Link2,
  FileText,
  FileImage,
  Film,
  FileSpreadsheet,
  File,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import StatusBadge from '@/components/status-badge';
import type { Asset } from '@/types/asset';
import { cn } from '@/lib/utils';

interface AssetCardProps {
  asset: Asset;
  viewMode?: 'grid' | 'list';
}

function FileTypeIcon({ fileType, className }: { fileType: string; className?: string }) {
  const type = fileType.toUpperCase();
  const iconClass = cn('text-slate-400', className);

  if (['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP', 'SVG'].includes(type))
    return <FileImage className={iconClass} />;
  if (['MP4', 'MOV', 'AVI', 'WEBM'].includes(type)) return <Film className={iconClass} />;
  if (['PDF', 'DOC', 'DOCX'].includes(type)) return <FileText className={iconClass} />;
  if (['XLS', 'XLSX', 'CSV'].includes(type)) return <FileSpreadsheet className={iconClass} />;
  return <File className={iconClass} />;
}

function isImageType(fileType: string) {
  return ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP', 'SVG'].includes(fileType.toUpperCase());
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function handleDownload(asset: Asset) {
  try {
    const response = await fetch(asset.fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.name}.${asset.fileType.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch {
    window.open(asset.fileUrl, '_blank');
  }
}

function handleCopyLink(asset: Asset) {
  const url = `${window.location.origin}/assets/${asset.id}`;
  navigator.clipboard.writeText(url).catch(() => {});
}

// Shared icon button styles for tooltip triggers
const iconBtnBase =
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer border-0 p-0 bg-transparent';

export default function AssetCard({ asset, viewMode = 'grid' }: AssetCardProps) {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow group">
        {/* Thumbnail */}
        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
          {asset.thumbnailUrl && isImageType(asset.fileType) ? (
            <Image
              src={asset.thumbnailUrl}
              alt={asset.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : isImageType(asset.fileType) && asset.fileUrl ? (
            <Image
              src={asset.fileUrl}
              alt={asset.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <FileTypeIcon fileType={asset.fileType} className="w-8 h-8" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/assets/${asset.id}`} className="hover:text-blue-600 transition-colors">
            <h3 className="font-medium text-slate-900 truncate">{asset.name}</h3>
          </Link>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-slate-500">{asset.category}</span>
            <span className="text-slate-300">•</span>
            <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-slate-50">
              {asset.fileType}
            </Badge>
            {asset.fileSize > 0 && (
              <span className="text-xs text-slate-400">{formatFileSize(asset.fileSize)}</span>
            )}
          </div>
        </div>

        {/* Status */}
        <StatusBadge status={asset.status} />

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger
              className={cn(iconBtnBase, 'h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100')}
              onClick={() => handleDownload(asset)}
            >
              <Download className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              className={cn(iconBtnBase, 'h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100')}
              onClick={() => handleCopyLink(asset)}
            >
              <Link2 className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>Copy Link</TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200">
      {/* Thumbnail area */}
      <Link href={`/assets/${asset.id}`}>
        <div className="relative aspect-square bg-slate-50 border-b border-slate-100 flex items-center justify-center overflow-hidden">
          {asset.thumbnailUrl && isImageType(asset.fileType) ? (
            <Image
              src={asset.thumbnailUrl}
              alt={asset.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          ) : isImageType(asset.fileType) && asset.fileUrl ? (
            <Image
              src={asset.fileUrl}
              alt={asset.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <FileTypeIcon fileType={asset.fileType} className="w-12 h-12" />
              <span className="text-xs font-medium uppercase tracking-wide">{asset.fileType}</span>
            </div>
          )}

          {/* Hover overlay with quick actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Tooltip>
              <TooltipTrigger
                className={cn(
                  iconBtnBase,
                  'h-9 w-9 bg-white text-slate-900 hover:bg-slate-100 rounded-md'
                )}
                onClick={(e) => {
                  e.preventDefault();
                  handleDownload(asset);
                }}
              >
                <Download className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                className={cn(
                  iconBtnBase,
                  'h-9 w-9 bg-white text-slate-900 hover:bg-slate-100 rounded-md'
                )}
                onClick={(e) => {
                  e.preventDefault();
                  handleCopyLink(asset);
                }}
              >
                <Link2 className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Copy Link</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Link>

      {/* Card content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            href={`/assets/${asset.id}`}
            className="flex-1 min-w-0 hover:text-blue-600 transition-colors"
          >
            <h3 className="font-medium text-sm text-slate-900 truncate leading-snug">
              {asset.name}
            </h3>
          </Link>
          <StatusBadge status={asset.status} className="flex-shrink-0 text-xs" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 truncate">{asset.category}</span>
          <span className="text-slate-300 text-xs">·</span>
          <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-slate-50 leading-none">
            {asset.fileType}
          </Badge>
        </div>
        {asset.fileSize > 0 && (
          <p className="text-xs text-slate-400 mt-1">{formatFileSize(asset.fileSize)}</p>
        )}
      </div>
    </div>
  );
}
