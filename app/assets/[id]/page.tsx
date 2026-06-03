import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Link2,
  FileText,
  FileImage,
  Film,
  FileSpreadsheet,
  File,
  User,
  Tag,
  Calendar,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import StatusBadge from '@/components/status-badge';
import CopyButton from '@/components/copy-button';
import { getAsset } from '@/lib/workiom';

function FileTypeIcon({ fileType, className }: { fileType: string; className?: string }) {
  const type = fileType.toUpperCase();
  if (['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP', 'SVG'].includes(type))
    return <FileImage className={className} />;
  if (['MP4', 'MOV', 'AVI', 'WEBM'].includes(type)) return <Film className={className} />;
  if (['PDF', 'DOC', 'DOCX'].includes(type)) return <FileText className={className} />;
  if (['XLS', 'XLSX', 'CSV'].includes(type)) return <FileSpreadsheet className={className} />;
  return <File className={className} />;
}

function isImageType(fileType: string) {
  return ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP', 'SVG'].includes(fileType.toUpperCase());
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = await getAsset(id);

  if (!asset) notFound();

  const isImage = isImageType(asset.fileType);
  const isSvg = asset.fileType.toUpperCase() === 'SVG';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const assetPageUrl = `${appUrl}/assets/${asset.id}`;

  return (
    <div className="bg-white flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left: Preview */}
          <div className="lg:col-span-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden aspect-video lg:aspect-auto lg:min-h-80 flex items-center justify-center p-8">
              {isImage && (asset.thumbnailUrl || asset.fileUrl) ? (
                <div className="relative w-full h-full min-h-64 lg:min-h-96">
                  <Image
                    src={asset.thumbnailUrl || asset.fileUrl}
                    alt={asset.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-contain"
                    priority
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-slate-400 py-12">
                  <FileTypeIcon
                    fileType={asset.fileType}
                    className="w-20 h-20 text-slate-300"
                  />
                  <div className="text-center">
                    <p className="text-lg font-medium text-slate-500">{asset.fileType} File</p>
                    <p className="text-sm text-slate-400">{formatFileSize(asset.fileSize)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {asset.description && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{asset.description}</p>
              </div>
            )}

            {/* Deprecation reason */}
            {asset.status === 'Deprecated' && asset.deprecationReason && (
              <div className="mt-4 flex items-start gap-2 p-4 bg-red-50 border border-red-100 rounded-lg">
                <TrendingDown className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700">Deprecated</p>
                  <p className="text-sm text-red-600">{asset.deprecationReason}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Metadata & Actions */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <h1 className="text-2xl font-bold text-slate-900 leading-tight">{asset.name}</h1>
                <StatusBadge status={asset.status} className="flex-shrink-0 mt-1" />
              </div>

              {/* Category badge */}
              <Badge variant="secondary" className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
                {asset.category}
              </Badge>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 mb-6">
                <a href={asset.fileUrl} download target="_blank" rel="noopener noreferrer">
                  <Button className="w-full h-11 bg-[#4E86F7] hover:bg-[#3a72e3] text-white gap-2">
                    <Download className="h-4 w-4" />
                    Download {asset.fileType}
                  </Button>
                </a>
                <CopyButton
                  value={assetPageUrl}
                  label="Copy Link"
                  icon="link"
                  className="w-full h-10"
                />
                {isImage && (
                  <CopyButton
                    value={asset.fileUrl}
                    label="Copy File URL"
                    icon="image"
                    className="w-full h-10"
                  />
                )}
                {isSvg && (
                  <CopyButton
                    value={asset.fileUrl}
                    label="Copy as SVG"
                    icon="svg"
                    className="w-full h-10"
                  />
                )}
              </div>

              <Separator className="mb-5" />

              {/* Metadata */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">Details</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">File Type</p>
                    <p className="font-medium text-slate-900">{asset.fileType || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">File Size</p>
                    <p className="font-medium text-slate-900">{formatFileSize(asset.fileSize)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">Downloads</p>
                    <p className="font-medium text-slate-900">
                      {asset.downloadCount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">Owner</p>
                    <p className="font-medium text-slate-900 flex items-center gap-1 truncate">
                      <User className="h-3 w-3 text-slate-400 flex-shrink-0" />
                      {asset.owner || '—'}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {asset.tags.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs mb-2 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {asset.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/browse?search=${encodeURIComponent(tag)}`}
                          className="inline-flex"
                        >
                          <Badge
                            variant="secondary"
                            className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
                          >
                            {tag}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
