import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, Download, User, Tag, TrendingDown,
} from '@/components/client-icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import StatusBadge from '@/components/status-badge';
import CopyButton from '@/components/copy-button';
import { getAsset } from '@/lib/appwrite-assets';
import type { AssetFormat } from '@/types/asset';

const FORMAT_COLORS: Record<AssetFormat, string> = {
  SVG: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
  PNG: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  JPG: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
};

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

  const previewUrl = asset.thumbnailUrl ?? asset.svgUrl ?? asset.pngUrl ?? asset.jpgUrl;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const assetPageUrl = `${appUrl}/assets/${asset.id}`;

  return (
    <div className="bg-white flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div
              className="border border-slate-200 rounded-2xl overflow-hidden aspect-video lg:aspect-auto lg:min-h-80 flex items-center justify-center p-8"
              style={{
                background: `linear-gradient(45deg,#f0f0f0 25%,transparent 25%),linear-gradient(-45deg,#f0f0f0 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#f0f0f0 75%),linear-gradient(-45deg,transparent 75%,#f0f0f0 75%)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0,0 10px,10px -10px,-10px 0px',
                backgroundColor: '#fafafa',
              }}
            >
              {previewUrl ? (
                <div className="relative w-full h-full min-h-64 lg:min-h-96">
                  <Image
                    src={previewUrl}
                    alt={asset.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-contain"
                    priority
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-400 py-12">
                  <div className="flex gap-2">
                    {asset.formats.map((fmt) => (
                      <Badge key={fmt} variant="outline" className={FORMAT_COLORS[fmt]}>
                        {fmt}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400">No preview available</p>
                </div>
              )}
            </div>

            {asset.description && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{asset.description}</p>
              </div>
            )}

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
              <div className="flex items-start justify-between gap-3 mb-4">
                <h1 className="text-2xl font-bold text-slate-900 leading-tight">{asset.name}</h1>
                <StatusBadge status={asset.status} className="flex-shrink-0 mt-1" />
              </div>

              <Badge variant="secondary" className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
                {asset.category}
              </Badge>

              {/* Download per format */}
              <div className="flex flex-col gap-2 mb-6">
                {asset.formats.map((fmt) => {
                  const url =
                    fmt === 'SVG' ? asset.svgUrl :
                    fmt === 'PNG' ? asset.pngUrl :
                    asset.jpgUrl;
                  if (!url) return null;
                  return (
                    <a key={fmt} href={url} download target="_blank" rel="noopener noreferrer">
                      <Button
                        className={`w-full h-11 gap-2 border font-medium ${FORMAT_COLORS[fmt]}`}
                        variant="outline"
                      >
                        <Download className="h-4 w-4" />
                        Download {fmt}
                      </Button>
                    </a>
                  );
                })}
                {asset.formats.length === 0 && (
                  <Button disabled variant="outline" className="w-full h-11 gap-2">
                    <Download className="h-4 w-4" />
                    No files attached
                  </Button>
                )}
                <CopyButton
                  value={assetPageUrl}
                  label="Copy Link"
                  icon="link"
                  className="w-full h-10"
                />
              </div>

              <Separator className="mb-5" />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">Details</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">Formats</p>
                    <div className="flex gap-1 flex-wrap">
                      {asset.formats.map((fmt) => (
                        <span key={fmt} className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${FORMAT_COLORS[fmt]}`}>
                          {fmt}
                        </span>
                      ))}
                      {asset.formats.length === 0 && <span className="font-medium text-slate-900">—</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">File Size</p>
                    <p className="font-medium text-slate-900">{formatFileSize(asset.fileSize)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">Downloads</p>
                    <p className="font-medium text-slate-900">{asset.downloadCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">Owner</p>
                    <p className="font-medium text-slate-900 flex items-center gap-1 truncate">
                      <User className="h-3 w-3 text-slate-400 flex-shrink-0" />
                      {asset.owner || '—'}
                    </p>
                  </div>
                </div>

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
