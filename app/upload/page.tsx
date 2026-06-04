'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { AssetFormat } from '@/types/asset';
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  CloudUpload,
  FileImage,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CATEGORIES, STATUS_OPTIONS } from '@/lib/constants';

type UploadStep = 'idle' | 'uploading' | 'creating' | 'done' | 'error';

const FORMAT_ACCEPT: Record<AssetFormat, string> = {
  SVG: '.svg,image/svg+xml',
  PNG: '.png,image/png',
  JPG: '.jpg,.jpeg,image/jpeg',
};

const FORMAT_MIME: Record<AssetFormat, string> = {
  SVG: 'image/svg+xml',
  PNG: 'image/png',
  JPG: 'image/jpeg',
};

interface FormatSlot {
  format: AssetFormat;
  file: File | null;
  previewUrl: string | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FormatDropZone({
  slot,
  onFileSelect,
  onRemove,
}: {
  slot: FormatSlot;
  onFileSelect: (format: AssetFormat, file: File) => void;
  onRemove: (format: AssetFormat) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(slot.format, file);
  }

  const formatColors: Record<AssetFormat, string> = {
    SVG: 'border-violet-200 bg-violet-50 text-violet-700',
    PNG: 'border-blue-200 bg-blue-50 text-blue-700',
    JPG: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };

  const labelColor = formatColors[slot.format];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={`text-xs font-semibold px-2 py-0.5 ${labelColor}`}
        >
          {slot.format}
        </Badge>
        {slot.format === 'SVG' && (
          <span className="text-xs text-slate-400">Required</span>
        )}
        {slot.format !== 'SVG' && (
          <span className="text-xs text-slate-400">Optional</span>
        )}
      </div>

      {slot.file ? (
        <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3 bg-slate-50">
          {slot.previewUrl ? (
            <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-slate-100 bg-white flex items-center justify-center">
              <Image
                src={slot.previewUrl}
                alt={slot.format}
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
              <FileImage className="h-5 w-5 text-slate-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{slot.file.name}</p>
            <p className="text-xs text-slate-400">{formatFileSize(slot.file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(slot.format)}
            className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
            dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <CloudUpload className="h-7 w-7 text-slate-300 mx-auto mb-1.5" />
          <p className="text-xs text-slate-500">
            Drop {slot.format} file or <span className="text-blue-600 font-medium">browse</span>
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={FORMAT_ACCEPT[slot.format]}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(slot.format, file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .catch((statusOrErr) => {
        if (statusOrErr === 401) router.replace('/login');
      })
      .finally(() => setAuthChecked(true));
  }, [router]);

  const [slots, setSlots] = useState<FormatSlot[]>([
    { format: 'SVG', file: null, previewUrl: null },
    { format: 'PNG', file: null, previewUrl: null },
    { format: 'JPG', file: null, previewUrl: null },
  ]);

  const [step, setStep] = useState<UploadStep>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    owner: '',
    status: 'Active',
  });

  const handleFileSelect = useCallback((format: AssetFormat, file: File) => {
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    setSlots((prev) =>
      prev.map((s) => {
        if (s.format !== format) return s;
        if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
        return { ...s, file, previewUrl };
      })
    );
    setFormData((prev) => ({
      ...prev,
      name: prev.name || file.name.replace(/\.[^.]+$/, ''),
    }));
  }, []);

  function handleRemove(format: AssetFormat) {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.format !== format) return s;
        if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
        return { ...s, file: null, previewUrl: null };
      })
    );
  }

  function handleInputChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function uploadFormat(slot: FormatSlot): Promise<string | null> {
    if (!slot.file) return null;
    const form = new FormData();
    form.append('file', slot.file, slot.file.name);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Failed to upload ${slot.format} file`);
    const { fileId } = await res.json();
    return fileId as string;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const svgSlot = slots.find((s) => s.format === 'SVG');
    if (!svgSlot?.file) {
      setErrorMessage('Please upload at least an SVG file.');
      return;
    }
    if (!formData.name.trim()) {
      setErrorMessage('Please enter a name for this asset.');
      return;
    }
    if (!formData.category) {
      setErrorMessage('Please select a category.');
      return;
    }

    setErrorMessage('');
    setStep('uploading');

    try {
      const [svgFileId, pngFileId, jpgFileId] = await Promise.all(
        slots.map((s) => uploadFormat(s))
      );

      setStep('creating');

      const tags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const assetRes = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category,
          tags,
          status: formData.status,
          owner: formData.owner.trim() || undefined,
          svgFileId: svgFileId ?? undefined,
          pngFileId: pngFileId ?? undefined,
          jpgFileId: jpgFileId ?? undefined,
          fileSize: svgSlot.file.size,
        }),
      });

      if (!assetRes.ok) throw new Error('Failed to create asset record');
      const asset = await assetRes.json();

      setStep('done');
      setTimeout(() => {
        router.push(`/assets/${asset.id}`);
      }, 1500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setStep('error');
    }
  }

  const isUploading = step === 'uploading' || step === 'creating';
  const hasSvg = !!slots.find((s) => s.format === 'SVG')?.file;

  const stepLabel: Record<string, string> = {
    uploading: 'Uploading files...',
    creating: 'Creating asset record...',
  };

  if (!authChecked) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Upload Asset</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Add a new brand asset. Upload SVG (required) plus PNG and JPG variants.
          </p>
        </div>

        {step === 'done' ? (
          <div className="bg-white border border-green-200 rounded-2xl p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Upload Complete!</h2>
            <p className="text-slate-500">Redirecting to your asset...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Format upload slots */}
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-4 block">
                  Files <span className="text-red-500">*</span>
                  <span className="font-normal text-slate-400 ml-1">(SVG required, PNG & JPG optional)</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {slots.map((slot) => (
                    <FormatDropZone
                      key={slot.format}
                      slot={slot}
                      onFileSelect={handleFileSelect}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Primary Logo"
                    required
                    className="h-10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of this asset..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => handleInputChange('category', v ?? '')}
                    required
                  >
                    <SelectTrigger id="category" className="h-10">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => handleInputChange('status', v ?? 'Active')}
                  >
                    <SelectTrigger id="status" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((st) => (
                        <SelectItem key={st} value={st}>
                          {st}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="owner" className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Owner
                  </Label>
                  <Input
                    id="owner"
                    value={formData.owner}
                    onChange={(e) => handleInputChange('owner', e.target.value)}
                    placeholder="e.g. Design Team"
                    className="h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="tags" className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Tags
                    <span className="text-slate-400 font-normal ml-1 text-xs">(comma-separated)</span>
                  </Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="logo, brand, primary"
                    className="h-10"
                  />
                </div>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* Submit */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={!hasSvg || isUploading}
                  className="h-11 px-8 bg-[#4E86F7] hover:bg-[#3a72e3] text-white font-medium gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {stepLabel[step] ?? 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Asset
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploading}
                  onClick={() => router.back()}
                  className="h-11"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
