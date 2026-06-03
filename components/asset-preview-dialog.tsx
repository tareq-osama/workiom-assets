'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Download,
  ExternalLink,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Film,
  Tag,
  User,
  HardDrive,
  TrendingDown,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import StatusBadge from '@/components/status-badge';
import CopyButton from '@/components/copy-button';
import type { Asset } from '@/types/asset';

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

function isImage(fileType: string) {
  return ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP', 'SVG'].includes(fileType.toUpperCase());
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

export default function AssetPreviewDialog({ asset, open, onOpenChange }: AssetPreviewDialogProps) {
  if (!asset) return null;

  const previewUrl = asset.thumbnailUrl || (isImage(asset.fileType) ? asset.fileUrl : null);
  const isSvg = asset.fileType.toUpperCase() === 'SVG';
  const size = formatSize(asset.fileSize);
  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const assetPageUrl = `${appUrl}/assets/${asset.id}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-white rounded-2xl gap-0 max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">{asset.name}</DialogTitle>

        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="font-semibold text-slate-900 truncate text-base">{asset.name}</h2>
            <StatusBadge status={asset.status} />
          </div>
          <Link
            href={`/assets/${asset.id}`}
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors ml-4 flex-shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Full page
          </Link>
        </div>

        {/* Body — scrollable */}
        <div className="flex flex-col md:flex-row overflow-auto flex-1 min-h-0">

          {/* Left — preview */}
          <div className="md:w-[55%] bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 flex items-center justify-center p-6 min-h-52">
            {previewUrl ? (
              <div className="relative w-full h-full min-h-52 md:min-h-72">
                <Image
                  src={previewUrl}
                  alt={asset.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-contain"
                  unoptimized={previewUrl.includes('.svg') || previewUrl.includes('.webp')}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400 py-10">
                <FileTypeIcon fileType={asset.fileType} className="w-16 h-16 text-slate-300" />
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                  {asset.fileType || 'File'}
                </p>
              </div>
            )}
          </div>

          {/* Right — details + actions */}
          <div className="md:w-[45%] flex flex-col overflow-y-auto">
            <div className="p-5 flex flex-col gap-4 flex-1">

              {/* Category */}
              <Badge variant="secondary" className="self-start bg-blue-50 text-blue-700 border-blue-200 text-xs">
                {asset.category}
              </Badge>

              {/* Description */}
              {asset.description ? (
                <p className="text-sm text-slate-600 leading-relaxed">{asset.description}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">No description</p>
              )}

              {/* Tags */}
              {asset.tags.length > 0 && (
                <div>
                  <p className="flex items-center gap-1 text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                    <Tag className="h-3 w-3" /> Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {asset.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
                        onClick={() => {
                          onOpenChange(false);
                          window.location.href = `/browse?search=${encodeURIComponent(tag)}`;
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Deprecation notice */}
              {asset.status === 'Deprecated' && asset.deprecationReason && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <TrendingDown className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-0.5">Deprecated</p>
                    <p className="text-xs text-red-600">{asset.deprecationReason}</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">File type</p>
                  <p className="font-medium text-slate-800">{asset.fileType || '—'}</p>
                </div>
                {size && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
                      <HardDrive className="h-3 w-3" /> Size
                    </p>
                    <p className="font-medium text-slate-800">{size}</p>
                  </div>
                )}
                {asset.owner && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
                      <User className="h-3 w-3" /> Owner
                    </p>
                    <p className="font-medium text-slate-800 truncate">{asset.owner}</p>
                  </div>
                )}
                {asset.downloadCount > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Downloads</p>
                    <p className="font-medium text-slate-800">{asset.downloadCount.toLocaleString()}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {asset.fileUrl ? (
                  <Button
                    className="w-full h-10 bg-[#4E86F7] hover:bg-[#3a72e3] text-white gap-2"
                    onClick={() => triggerDownload(asset)}
                  >
                    <Download className="h-4 w-4" />
                    Download {asset.fileType}
                  </Button>
                ) : (
                  <Button disabled className="w-full h-10 gap-2">
                    <Download className="h-4 w-4" />
                    No file attached
                  </Button>
                )}
                <CopyButton
                  value={assetPageUrl}
                  label="Copy Link"
                  icon="link"
                  className="w-full h-9"
                />
                {isImage(asset.fileType) && asset.fileUrl && (
                  <CopyButton
                    value={asset.fileUrl}
                    label="Copy File URL"
                    icon="image"
                    className="w-full h-9"
                  />
                )}
                {isSvg && asset.fileUrl && (
                  <CopyButton
                    value={asset.fileUrl}
                    label="Copy as SVG"
                    icon="svg"
                    className="w-full h-9"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
