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
  ExternalLink,
  Video,
  Camera,
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
import CategoryPicker from '@/components/category-picker';
import { STATUS_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/appwrite-categories';

type UploadStep = 'idle' | 'uploading' | 'creating' | 'done' | 'error';
type AssetMode = 'files' | 'link' | 'video';
type VideoSource = 'device' | 'link';
type ThumbSource = 'frame' | 'upload';

const FORMAT_ACCEPT: Record<AssetFormat, string> = {
  SVG: '.svg,image/svg+xml',
  PNG: '.png,image/png',
  JPG: '.jpg,.jpeg,image/jpeg',
  MP4: '.mp4,.mov,.webm,video/*',
};

interface FormatSlot {
  format: AssetFormat;
  file: File | null;
  previewUrl: string | null;
}

interface CoverSlot {
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
    MP4: 'border-rose-200 bg-rose-50 text-rose-700',
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

function CoverImageDropZone({
  slot,
  onChange,
  onRemove,
  label = 'Cover Image',
  hint = 'Required — displayed as the asset thumbnail',
}: {
  slot: CoverSlot;
  onChange: (file: File) => void;
  onRemove: () => void;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onChange(file);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-blue-200 bg-blue-50 text-blue-700">
          {label}
        </Badge>
        <span className="text-xs text-slate-400">{hint}</span>
      </div>

      {slot.file ? (
        <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3 bg-slate-50">
          {slot.previewUrl ? (
            <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-100 bg-white flex items-center justify-center">
              <Image
                src={slot.previewUrl}
                alt="Cover"
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
              <FileImage className="h-6 w-6 text-slate-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{slot.file.name}</p>
            <p className="text-xs text-slate-400">{formatFileSize(slot.file.size)}</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
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
          <CloudUpload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">
            Drop an image or <span className="text-blue-600 font-medium">browse</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, SVG, or any image</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.svg,image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function VideoDropZone({
  file,
  onChange,
  onRemove,
}: {
  file: File | null;
  onChange: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onChange(dropped);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-rose-200 bg-rose-50 text-rose-700">
          Video File
        </Badge>
        <span className="text-xs text-slate-400">Required</span>
      </div>

      {file ? (
        <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3 bg-slate-50">
          <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
            <Video className="h-5 w-5 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
            <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
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
          <CloudUpload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">
            Drop a video or <span className="text-blue-600 font-medium">browse</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">MP4, MOV, WebM, or any video file</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) onChange(selected);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function VideoFrameCapture({
  file,
  capturedPreviewUrl,
  onCapture,
}: {
  file: File;
  capturedPreviewUrl: string | null;
  onCapture: (blob: Blob, previewUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [src] = useState(() => URL.createObjectURL(file));

  useEffect(() => () => URL.revokeObjectURL(src), [src]);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    setCapturing(true);
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        setCapturing(false);
        if (blob) onCapture(blob, URL.createObjectURL(blob));
      },
      'image/jpeg',
      0.85
    );
  }

  return (
    <div className="space-y-2">
      <video ref={videoRef} src={src} controls className="w-full max-h-56 rounded-xl border border-slate-200 bg-black" />
      <p className="text-xs text-slate-400">Scrub to the frame you want, then capture it.</p>
      <Button type="button" variant="outline" onClick={capture} disabled={capturing} className="w-full h-9">
        {capturing ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Camera className="h-4 w-4 mr-1.5" />}
        Capture current frame
      </Button>
      {capturedPreviewUrl && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <Image
            src={capturedPreviewUrl}
            alt="Captured thumbnail"
            width={48}
            height={48}
            className="w-12 h-12 rounded-lg object-cover border border-emerald-200"
            unoptimized
          />
          <span className="text-xs text-emerald-700 font-medium">Frame captured — this will be used as the thumbnail</span>
        </div>
      )}
    </div>
  );
}

const MODE_OPTIONS: { key: AssetMode; label: string; desc: string; icon: typeof Upload }[] = [
  { key: 'files', label: 'Files', desc: 'SVG, PNG, JPG', icon: Upload },
  { key: 'link', label: 'External Link', desc: 'Canva, Figma, etc.', icon: ExternalLink },
  { key: 'video', label: 'Video', desc: 'Device or a link', icon: Video },
];

export default function UploadPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mode, setMode] = useState<AssetMode>('files');
  const [videoSource, setVideoSource] = useState<VideoSource>('device');
  const [thumbSource, setThumbSource] = useState<ThumbSource>('frame');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .catch((statusOrErr) => {
        if (statusOrErr === 401) router.replace('/login');
      })
      .finally(() => setAuthChecked(true));

    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, [router]);

  const [slots, setSlots] = useState<FormatSlot[]>([
    { format: 'SVG', file: null, previewUrl: null },
    { format: 'PNG', file: null, previewUrl: null },
    { format: 'JPG', file: null, previewUrl: null },
  ]);

  const [coverSlot, setCoverSlot] = useState<CoverSlot>({ file: null, previewUrl: null });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [capturedFrame, setCapturedFrame] = useState<{ blob: Blob | null; previewUrl: string | null }>({
    blob: null,
    previewUrl: null,
  });

  const [step, setStep] = useState<UploadStep>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    owner: '',
    status: 'Active',
    externalUrl: '',
  });

  const handleFileSelect = useCallback((format: AssetFormat, file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const isImg = file.type.startsWith('image/') || ['svg', 'png', 'jpg', 'jpeg'].includes(ext);
    const previewUrl = isImg ? URL.createObjectURL(file) : null;
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

  function handleCoverChange(file: File) {
    const previewUrl = URL.createObjectURL(file);
    setCoverSlot((prev) => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { file, previewUrl };
    });
    setFormData((prev) => ({
      ...prev,
      name: prev.name || file.name.replace(/\.[^.]+$/, ''),
    }));
  }

  function handleCoverRemove() {
    setCoverSlot((prev) => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { file: null, previewUrl: null };
    });
  }

  function handleVideoSelect(file: File) {
    setVideoFile(file);
    setCapturedFrame((prev) => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { blob: null, previewUrl: null };
    });
    setThumbSource('frame');
    setFormData((prev) => ({
      ...prev,
      name: prev.name || file.name.replace(/\.[^.]+$/, ''),
    }));
  }

  function handleVideoRemove() {
    setVideoFile(null);
    setCapturedFrame((prev) => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { blob: null, previewUrl: null };
    });
  }

  function handleFrameCapture(blob: Blob, previewUrl: string) {
    setCapturedFrame((prev) => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { blob, previewUrl };
    });
  }

  function handleInputChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleCategoryCreated(category: Category) {
    setCategories((prev) => [...prev, category]);
  }

  async function uploadFileFull(file: File): Promise<{ fileId: string; fileUrl: string }> {
    const form = new FormData();
    form.append('file', file, file.name);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    if (!res.ok) throw new Error('Failed to upload file');
    return res.json();
  }

  async function uploadFile(file: File): Promise<string> {
    const { fileId } = await uploadFileFull(file);
    return fileId;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Please enter a name for this asset.');
      return;
    }
    if (!formData.category) {
      setErrorMessage('Please select a category.');
      return;
    }

    const tags = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (mode === 'link') {
      if (!coverSlot.file) {
        setErrorMessage('Please upload a cover image.');
        return;
      }
      if (!formData.externalUrl.trim()) {
        setErrorMessage('Please enter the external link URL.');
        return;
      }
      if (!/^https?:\/\/.+/.test(formData.externalUrl.trim())) {
        setErrorMessage('Please enter a valid URL starting with http:// or https://');
        return;
      }

      setStep('uploading');
      try {
        const thumbnailFileId = await uploadFile(coverSlot.file);
        setStep('creating');

        const assetRes = await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            description: `[LINK]${formData.externalUrl.trim()}`,
            category: formData.category,
            tags,
            status: formData.status,
            owner: formData.owner.trim() || undefined,
            thumbnailFileId,
            formats: [],
            fileSize: coverSlot.file.size,
          }),
        });

        if (!assetRes.ok) throw new Error('Failed to create asset record');
        setStep('done');
        setTimeout(() => router.push('/'), 1500);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Upload failed. Please try again.');
        setStep('error');
      }
      return;
    }

    if (mode === 'video') {
      if (videoSource === 'device') {
        if (!videoFile) {
          setErrorMessage('Please upload a video file.');
          return;
        }
        const thumbFile = thumbSource === 'upload' ? coverSlot.file : null;
        if (thumbSource === 'frame' && !capturedFrame.blob) {
          setErrorMessage('Please capture a frame to use as the thumbnail.');
          return;
        }
        if (thumbSource === 'upload' && !thumbFile) {
          setErrorMessage('Please upload a thumbnail image.');
          return;
        }

        setStep('uploading');
        try {
          const { fileUrl } = await uploadFileFull(videoFile);
          const thumbnailFileId =
            thumbSource === 'frame' && capturedFrame.blob
              ? await uploadFile(new File([capturedFrame.blob], 'thumbnail.jpg', { type: 'image/jpeg' }))
              : await uploadFile(thumbFile!);
          setStep('creating');

          const assetRes = await fetch('/api/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.name.trim(),
              description: `[LINK]${fileUrl}`,
              category: formData.category,
              tags,
              status: formData.status,
              owner: formData.owner.trim() || undefined,
              thumbnailFileId,
              formats: ['MP4'],
              fileSize: videoFile.size,
            }),
          });

          if (!assetRes.ok) throw new Error('Failed to create asset record');
          setStep('done');
          setTimeout(() => router.push('/'), 1500);
        } catch (err) {
          setErrorMessage(err instanceof Error ? err.message : 'Upload failed. Please try again.');
          setStep('error');
        }
        return;
      }

      // videoSource === 'link'
      if (!coverSlot.file) {
        setErrorMessage('Please upload a thumbnail image.');
        return;
      }
      if (!formData.externalUrl.trim()) {
        setErrorMessage('Please enter the video link URL.');
        return;
      }
      if (!/^https?:\/\/.+/.test(formData.externalUrl.trim())) {
        setErrorMessage('Please enter a valid URL starting with http:// or https://');
        return;
      }

      setStep('uploading');
      try {
        const thumbnailFileId = await uploadFile(coverSlot.file);
        setStep('creating');

        const assetRes = await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            description: `[LINK]${formData.externalUrl.trim()}`,
            category: formData.category,
            tags,
            status: formData.status,
            owner: formData.owner.trim() || undefined,
            thumbnailFileId,
            formats: ['MP4'],
            fileSize: coverSlot.file.size,
          }),
        });

        if (!assetRes.ok) throw new Error('Failed to create asset record');
        setStep('done');
        setTimeout(() => router.push('/'), 1500);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Upload failed. Please try again.');
        setStep('error');
      }
      return;
    }

    // Standard upload mode
    const hasAnyFile = slots.some((s) => s.file !== null);
    if (!hasAnyFile) {
      setErrorMessage('Please upload at least one file (SVG, PNG, or JPG).');
      return;
    }

    setStep('uploading');
    try {
      const [svgFileId, pngFileId, jpgFileId] = await Promise.all(
        slots.map(async (s) => {
          if (!s.file) return null;
          return uploadFile(s.file);
        })
      );

      setStep('creating');

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
          fileSize: slots.find((s) => s.file)?.file?.size ?? 0,
        }),
      });

      if (!assetRes.ok) throw new Error('Failed to create asset record');
      const asset = await assetRes.json();
      setStep('done');
      setTimeout(() => router.push(`/assets/${asset.id}`), 1500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setStep('error');
    }
  }

  const isUploading = step === 'uploading' || step === 'creating';
  const hasAnyFile =
    mode === 'files'
      ? slots.some((s) => s.file !== null)
      : mode === 'link'
        ? Boolean(coverSlot.file)
        : videoSource === 'device'
          ? Boolean(videoFile) && (thumbSource === 'frame' ? Boolean(capturedFrame.blob) : Boolean(coverSlot.file))
          : Boolean(coverSlot.file);

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
            Add a new brand asset to the library.
          </p>
        </div>

        {step === 'done' ? (
          <div className="bg-white border border-green-200 rounded-2xl p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Upload Complete!</h2>
            <p className="text-slate-500">Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">

              {/* Asset type selector */}
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-3 block">Asset Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {MODE_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => { setMode(opt.key); setErrorMessage(''); }}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors',
                        mode === opt.key ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      <opt.icon className={cn('h-4 w-4', mode === opt.key ? 'text-blue-600' : 'text-slate-400')} />
                      <span className={cn('text-sm font-medium', mode === opt.key ? 'text-blue-700' : 'text-slate-700')}>
                        {opt.label}
                      </span>
                      <span className="text-[11px] text-slate-400">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Video source sub-toggle */}
              {mode === 'video' && (
                <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 w-fit">
                  {([
                    { key: 'device', label: 'From device' },
                    { key: 'link', label: 'From a link' },
                  ] as { key: VideoSource; label: string }[]).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => { setVideoSource(opt.key); setErrorMessage(''); }}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                        videoSource === opt.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* File upload area */}
              <div className="space-y-5">
                {mode === 'files' && (
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-4 block">
                      Files <span className="text-red-500">*</span>
                      <span className="font-normal text-slate-400 ml-1">(at least one required)</span>
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
                )}

                {mode === 'link' && (
                  <>
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-4 block">
                        Cover Image <span className="text-red-500">*</span>
                      </Label>
                      <CoverImageDropZone slot={coverSlot} onChange={handleCoverChange} onRemove={handleCoverRemove} />
                    </div>
                    <div>
                      <Label htmlFor="externalUrl" className="text-sm font-medium text-slate-700 mb-1.5 block">
                        External URL <span className="text-red-500">*</span>
                        <span className="text-slate-400 font-normal ml-1 text-xs">— clicking the asset will navigate here</span>
                      </Label>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="externalUrl"
                          type="url"
                          value={formData.externalUrl}
                          onChange={(e) => handleInputChange('externalUrl', e.target.value)}
                          placeholder="https://www.canva.com/design/..."
                          className="h-10 pl-9"
                        />
                      </div>
                    </div>
                  </>
                )}

                {mode === 'video' && videoSource === 'device' && (
                  <>
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-4 block">
                        Video <span className="text-red-500">*</span>
                      </Label>
                      <VideoDropZone file={videoFile} onChange={handleVideoSelect} onRemove={handleVideoRemove} />
                    </div>

                    {videoFile && (
                      <div>
                        <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                          Thumbnail <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 w-fit mb-3">
                          {([
                            { key: 'frame', label: 'Capture from video' },
                            { key: 'upload', label: 'Upload image' },
                          ] as { key: ThumbSource; label: string }[]).map((opt) => (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => setThumbSource(opt.key)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                                thumbSource === opt.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        {thumbSource === 'frame' ? (
                          <VideoFrameCapture
                            key={`${videoFile.name}-${videoFile.size}`}
                            file={videoFile}
                            capturedPreviewUrl={capturedFrame.previewUrl}
                            onCapture={handleFrameCapture}
                          />
                        ) : (
                          <CoverImageDropZone
                            slot={coverSlot}
                            onChange={handleCoverChange}
                            onRemove={handleCoverRemove}
                            hint="Required — displayed as the video thumbnail"
                          />
                        )}
                      </div>
                    )}
                  </>
                )}

                {mode === 'video' && videoSource === 'link' && (
                  <>
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-4 block">
                        Thumbnail <span className="text-red-500">*</span>
                      </Label>
                      <CoverImageDropZone
                        slot={coverSlot}
                        onChange={handleCoverChange}
                        onRemove={handleCoverRemove}
                        hint="Required — displayed as the video thumbnail"
                      />
                    </div>
                    <div>
                      <Label htmlFor="externalUrl" className="text-sm font-medium text-slate-700 mb-1.5 block">
                        Video Link <span className="text-red-500">*</span>
                        <span className="text-slate-400 font-normal ml-1 text-xs">— e.g. a Google Drive sharing link</span>
                      </Label>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="externalUrl"
                          type="url"
                          value={formData.externalUrl}
                          onChange={(e) => handleInputChange('externalUrl', e.target.value)}
                          placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                          className="h-10 pl-9"
                        />
                      </div>
                    </div>
                  </>
                )}
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
                    placeholder={mode === 'video' ? 'e.g. Marketing Video — English' : mode === 'link' ? 'e.g. Q4 Marketing Presentation' : 'e.g. Primary Logo'}
                    required
                    className="h-10"
                  />
                </div>

                {mode === 'files' && (
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
                )}

                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <CategoryPicker
                    id="category"
                    categories={categories}
                    value={formData.category}
                    onChange={(v) => handleInputChange('category', v)}
                    onCategoryCreated={handleCategoryCreated}
                  />
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
                    placeholder={mode === 'video' ? 'marketing, launch, 2026' : mode === 'link' ? 'presentation, canva, q4' : 'logo, brand, primary'}
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
                  disabled={!hasAnyFile || isUploading}
                  className="h-11 px-8 bg-[#4E86F7] hover:bg-[#3a72e3] text-white font-medium gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {stepLabel[step] ?? 'Uploading...'}
                    </>
                  ) : mode === 'link' ? (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      Add Link Asset
                    </>
                  ) : mode === 'video' ? (
                    <>
                      <Video className="h-4 w-4" />
                      Add Video
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
