'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CONTRIBUTOR_ROLES } from '@/lib/auth';
import type { UserRole } from '@/types/user';
import {
  Upload,
  X,
  File,
  CheckCircle,
  AlertCircle,
  Loader2,
  CloudUpload,
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

type UploadStep = 'idle' | 'uploading' | 'confirming' | 'creating' | 'done' | 'error';

interface FormData {
  name: string;
  description: string;
  category: string;
  tags: string;
  owner: string;
  status: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(file: File): string {
  const ext = file.name.split('.').pop()?.toUpperCase() ?? '';
  return (ext || (file.type.split('/')[1]?.toUpperCase() ?? 'Unknown'));
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        if (data?.user?.role) setUserRole(data.user.role as UserRole);
      })
      .catch((statusOrErr) => {
        if (statusOrErr === 401) router.replace('/login');
      })
      .finally(() => setAuthChecked(true));
  }, [router]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [step, setStep] = useState<UploadStep>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    tags: '',
    owner: '',
    status: 'Active',
  });

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setFormData((prev) => ({
      ...prev,
      name: prev.name || file.name.replace(/\.[^.]+$/, ''),
    }));

    // Generate preview for images
    const type = file.type;
    if (type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  function handleInputChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function removeFile() {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;
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
      // Step 1: Get pre-signed upload URL
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      });

      if (!uploadRes.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, fileToken } = await uploadRes.json();

      // Step 2: Upload file to S3
      const s3Res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': selectedFile.type },
        body: selectedFile,
      });

      if (!s3Res.ok) throw new Error('Failed to upload file to storage');

      // Step 3: Confirm upload
      setStep('confirming');
      const confirmRes = await fetch('/api/upload', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileToken }),
      });

      if (!confirmRes.ok) throw new Error('Failed to confirm upload');
      const { url: fileUrl } = await confirmRes.json();

      // Step 4: Create asset record
      setStep('creating');
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const assetRes = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name: formData.name.trim(),
          Description: formData.description.trim() || undefined,
          Category: formData.category,
          Tags: tagsArray.join(', '),
          'File URL': fileUrl,
          Status: formData.status,
          Owner: formData.owner.trim() || undefined,
          'File Type': getFileType(selectedFile),
          'File Size': selectedFile.size,
          'Download Count': 0,
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

  const isUploading = ['uploading', 'confirming', 'creating'].includes(step);

  // Show nothing while auth is being checked
  if (!authChecked) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  // Access denied for non-contributors
  if (!userRole || !CONTRIBUTOR_ROLES.includes(userRole)) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-10 max-w-md w-full text-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Upload className="h-6 w-6 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 text-sm">
            Upload is restricted to Design Team, Marketing Team, and Admin roles.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => router.push('/browse')}
          >
            Browse Assets
          </Button>
        </div>
      </div>
    );
  }

  const stepLabel: Record<string, string> = {
    uploading: 'Uploading file...',
    confirming: 'Confirming upload...',
    creating: 'Creating asset record...',
  };

  return (
    <div className="flex-1 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Upload Asset</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Add a new file to the Workiom Assets Library.
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
              {/* Drop zone */}
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                  File <span className="text-red-500">*</span>
                </Label>
                {selectedFile ? (
                  <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 bg-slate-50">
                    {previewUrl ? (
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-100">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                        <File className="h-7 w-7 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">
                        {selectedFile.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0 h-4 bg-white"
                        >
                          {getFileType(selectedFile)}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {formatFileSize(selectedFile.size)}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0 text-slate-400 hover:text-red-500"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                      dragging
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    aria-label="Upload file"
                  >
                    <CloudUpload className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium mb-1">
                      Drag & drop your file here
                    </p>
                    <p className="text-slate-400 text-sm mb-4">or click to browse</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="pointer-events-none"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Choose File
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
              </div>

              <Separator />

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="sm:col-span-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Workiom Logo 2024"
                    required
                    className="h-10"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-slate-700 mb-1.5 block"
                  >
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

                {/* Category */}
                <div>
                  <Label
                    htmlFor="category"
                    className="text-sm font-medium text-slate-700 mb-1.5 block"
                  >
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

                {/* Status */}
                <div>
                  <Label
                    htmlFor="status"
                    className="text-sm font-medium text-slate-700 mb-1.5 block"
                  >
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

                {/* Owner */}
                <div>
                  <Label
                    htmlFor="owner"
                    className="text-sm font-medium text-slate-700 mb-1.5 block"
                  >
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

                {/* Tags */}
                <div>
                  <Label
                    htmlFor="tags"
                    className="text-sm font-medium text-slate-700 mb-1.5 block"
                  >
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
              {step === 'error' && errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errorMessage}
                </div>
              )}
              {errorMessage && step === 'idle' && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* Submit */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={!selectedFile || isUploading}
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
