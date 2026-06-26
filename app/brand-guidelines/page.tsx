'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check, Copy, Download, ExternalLink, Menu, X, ArrowLeft, Heart,
  Pencil, Upload, Loader2, Plus, Minus, Trash2, ChevronLeft, ChevronRight, GripVertical,
} from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────
   Navigation
───────────────────────────────────────────── */
const NAV = [
  { id: 'introduction', label: 'Introduction', num: '01' },
  { id: 'logo',         label: 'Logo',         num: '02' },
  { id: 'typography',   label: 'Typography',   num: '03' },
  { id: 'color',        label: 'Color',        num: '04' },
  { id: 'brand-in-use', label: 'Brand in Use', num: '05' },
  { id: 'resources',    label: 'Resources',    num: '06' },
];

/* ─────────────────────────────────────────────
   Brand-in-Use types
───────────────────────────────────────────── */
type BIUCell = { id: string; imageUrl: string | null };
type BIURow  = { id: string; cells: BIUCell[] };
type BIUGrid = { rows: BIURow[] };

const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
};
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

/* ─────────────────────────────────────────────
   LLM copy payloads
───────────────────────────────────────────── */
const LLM = {
  full: `Workiom Brand Guide
──────────────────────
Brand: Workiom — AI-powered work management & no-code platform

Colors:
• Workiom Purple  #9635F0  RGB(150,53,240)   — primary
• Blue            #3C84FD  RGB(60,132,253)   — secondary / CTAs
• Dark Purple     #360C73  RGB(54,12,115)    — deep accent
• Violet          #8201AD  RGB(130,1,173)    — accent
• Yellow          #FDBC0B  RGB(253,188,11)   — highlight
• Light Gray      #D9D9D9  RGB(217,217,217)  — neutral

Primary gradient: linear-gradient(135deg, #360C73 0%, #8201AD 45%, #9635F0 100%)

Typography:
• Latin/English: General Sans (Bold, SemiBold, Medium, Regular, Light)
• Arabic: IBM Plex Sans Arabic`,

  logo: `Workiom Logo Guidelines
DO: white/light backgrounds · clear space · SVG format · white version on dark
DON'T: stretch · skew · rotate · mirror · glow · patterns · colored bg · keyline · alter colors`,

  typography: `Workiom Typography
General Sans — Latin/English (Bold, SemiBold, Medium, Regular, Light)
IBM Plex Sans Arabic — Arabic text`,

  colors: `Workiom Brand Colors
• #9635F0 Workiom Purple  • #3C84FD Blue  • #360C73 Dark Purple
• #8201AD Violet  • #FDBC0B Yellow  • #D9D9D9 Light Gray`,
};

/* ─────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────── */
function CopyLLMButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }
  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold',
        'bg-black text-white hover:bg-neutral-800 transition-all duration-150',
        'opacity-0 group-hover:opacity-100 whitespace-nowrap',
        className,
      )}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied!' : 'Copy for LLM'}
    </button>
  );
}

function ColorCopyButton({ hex, name, rgb }: { hex: string; name: string; rgb: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try { await navigator.clipboard.writeText(`${name}: ${hex}  RGB(${rgb})`); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  }
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 whitespace-nowrap opacity-0 group-hover/swatch:opacity-100 transition-opacity duration-150"
    >
      {copied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function LogoActions({ src, filename, dark }: { src: string; filename: string; dark?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    try { await navigator.clipboard.writeText(window.location.origin + src); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }
  const base = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-colors';
  const cls = dark
    ? cn(base, 'text-white/80 border-white/20 bg-white/10 hover:bg-white/20')
    : cn(base, 'text-slate-600 border-[#EAEAEA] bg-white hover:bg-slate-50');
  return (
    <div className="flex items-center gap-1.5 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-150">
      <a href={src} download={filename} className={cls}><Download className="h-2.5 w-2.5" />Download</a>
      <button onClick={handleCopy} className={cls}>
        {copied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
        {copied ? 'Copied!' : 'Copy URL'}
      </button>
    </div>
  );
}

function SectionBanner({ title }: { title: string }) {
  return (
    <div
      className="h-28 sm:h-40 flex items-end px-5 sm:px-10 md:px-16 pb-7 sm:pb-10"
      style={{ background: 'linear-gradient(135deg, #231F61 0%, #360C73 55%, #9635F0 100%)' }}
    >
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-none tracking-tight">{title}</h2>
    </div>
  );
}

function ColorSwatch({ name, hex, rgb, light, tall }: { name: string; hex: string; rgb: string; light?: boolean; tall?: boolean }) {
  const textCls = light ? 'text-slate-600' : 'text-white';
  return (
    <div
      className={cn('relative rounded-xl overflow-hidden group/swatch', tall ? 'min-h-36 sm:min-h-48' : 'min-h-24 sm:min-h-28')}
      style={{ backgroundColor: hex, border: light ? '1px solid #EAEAEA' : undefined }}
    >
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <p className={cn('text-[10px] sm:text-xs font-semibold mb-0.5 opacity-60', textCls)}>{name}</p>
        <p className={cn('text-xs sm:text-sm font-mono font-bold', textCls)}>{hex}</p>
        <p className={cn('text-[10px] font-mono opacity-40', textCls)}>RGB {rgb}</p>
      </div>
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
        <ColorCopyButton hex={hex} name={name} rgb={rgb} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page-level prev/next nav
───────────────────────────────────────────── */
function PageNav({ prev, next, onNavigate }: {
  prev: typeof NAV[0] | null;
  next: typeof NAV[0] | null;
  onNavigate: (id: string) => void;
}) {
  return (
    <div className="px-5 sm:px-10 md:px-16 py-8 border-t border-[#EDEDED] flex items-center justify-between gap-4">
      {prev ? (
        <button
          onClick={() => onNavigate(prev.id)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline text-slate-400 font-normal">{prev.num}</span>
          {prev.label}
        </button>
      ) : <div />}
      {next ? (
        <button
          onClick={() => onNavigate(next.id)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          {next.label}
          <span className="hidden sm:inline text-slate-400 font-normal">{next.num}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : <div />}
    </div>
  );
}

/* ─────────────────────────────────────────────
   BIU image cell with skeleton while loading
───────────────────────────────────────────── */
function BiuImageCell({ src, onClick }: { src: string; onClick: () => void }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-100 min-h-[80px]">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Brand application"
        className={cn(
          'w-full h-auto block cursor-pointer transition-[opacity,transform] duration-500 ease-out',
          loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none',
        )}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onClick={onClick}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sortable BIU row (drag-to-reorder)
───────────────────────────────────────────── */
interface SortableBiuRowProps {
  row: BIURow;
  editMode: boolean;
  uploadingCell: string | null;
  onAddCell: (rowId: string) => void;
  onRemoveCell: (rowId: string, cellId: string) => void;
  onRemoveRow: (rowId: string) => void;
  onUpload: (rowId: string, cellId: string, file: File) => void;
  onClearImage: (rowId: string, cellId: string) => void;
  onOpenLightbox: (url: string) => void;
}

function SortableBiuRow({
  row, editMode, uploadingCell,
  onAddCell, onRemoveCell, onRemoveRow, onUpload, onClearImage, onOpenLightbox,
}: SortableBiuRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const visibleCells = editMode ? row.cells : row.cells.filter(c => c.imageUrl);
  if (!editMode && visibleCells.length === 0) return null;
  const colClass = GRID_COLS[Math.min(visibleCells.length, 4)] ?? 'grid-cols-1';

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {editMode && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {/* Drag handle */}
            <button
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-500 transition-colors touch-none"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <button onClick={() => onAddCell(row.id)} disabled={row.cells.length >= 4}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <Plus className="h-3 w-3" /> Column
            </button>
            <button onClick={() => onRemoveCell(row.id, row.cells[row.cells.length - 1].id)} disabled={row.cells.length <= 1}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <Minus className="h-3 w-3" /> Column
            </button>
          </div>
          <button onClick={() => onRemoveRow(row.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 className="h-3 w-3" /> Remove row
          </button>
        </div>
      )}

      <div className={cn('grid gap-3 items-start', colClass)}>
        {visibleCells.map(cell => (
          <div key={cell.id} className={cn(
            'relative group/cell rounded-xl overflow-hidden',
            editMode && !cell.imageUrl ? 'min-h-[120px] bg-[#F4F4F4]' : '',
          )}>
            {cell.imageUrl ? (
              <>
                {editMode ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={cell.imageUrl} alt="Brand application" className="w-full h-auto block rounded-xl" />
                ) : (
                  <BiuImageCell src={cell.imageUrl} onClick={() => onOpenLightbox(cell.imageUrl!)} />
                )}
                {editMode && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/cell:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-150 rounded-xl">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 text-xs font-semibold rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                      <Upload className="h-3 w-3" /> Change
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(row.id, cell.id, f); }} />
                    </label>
                    <button onClick={() => onClearImage(row.id, cell.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors">
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                )}
              </>
            ) : editMode ? (
              <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#D0D0D0] rounded-xl cursor-pointer hover:border-[#9635F0] hover:bg-[#9635F0]/5 transition-all">
                {uploadingCell === cell.id ? <Loader2 className="h-6 w-6 text-slate-400 animate-spin" /> : <Upload className="h-6 w-6 text-slate-400" />}
                <span className="text-xs font-medium text-slate-400">{uploadingCell === cell.id ? 'Uploading…' : 'Click to upload'}</span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(row.id, cell.id, f); }} />
              </label>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default function BrandGuidelinesPage() {
  const router = useRouter();
  const [activePage, setActivePage] = useState('introduction');
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Brand in Use state */
  const [biu, setBiu] = useState<BIUGrid>({ rows: [] });
  const [biuLoading, setBiuLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editUser, setEditUser] = useState<{ name: string } | null>(null);
  const [uploadingCell, setUploadingCell] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = biu.rows.findIndex(r => r.id === active.id);
      const newIndex = biu.rows.findIndex(r => r.id === over.id);
      biuSave({ rows: arrayMove(biu.rows, oldIndex, newIndex) });
    }
  }

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setEditUser(d.user ?? null)).catch(() => {});
    fetch('/api/brand-applications')
      .then(r => r.json()).then(d => setBiu(d)).catch(() => {})
      .finally(() => setBiuLoading(false));
  }, []);

  async function biuSave(next: BIUGrid) {
    setBiu(next); setSaving(true);
    try { await fetch('/api/brand-applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }); }
    finally { setSaving(false); }
  }
  function biuAddRow(cols: number) {
    const cells: BIUCell[] = Array.from({ length: cols }, () => ({ id: uid(), imageUrl: null }));
    biuSave({ rows: [...biu.rows, { id: uid(), cells }] });
  }
  function biuRemoveRow(rowId: string) { biuSave({ rows: biu.rows.filter(r => r.id !== rowId) }); }
  function biuAddCell(rowId: string) {
    biuSave({ rows: biu.rows.map(r => r.id === rowId && r.cells.length < 4 ? { ...r, cells: [...r.cells, { id: uid(), imageUrl: null }] } : r) });
  }
  function biuRemoveCell(rowId: string, cellId: string) {
    biuSave({ rows: biu.rows.map(r => r.id === rowId ? { ...r, cells: r.cells.filter(c => c.id !== cellId) } : r).filter(r => r.cells.length > 0) });
  }
  async function biuUpload(rowId: string, cellId: string, file: File) {
    setUploadingCell(cellId);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const { fileUrl } = await res.json();
      if (!fileUrl) return;
      biuSave({ rows: biu.rows.map(r => r.id === rowId ? { ...r, cells: r.cells.map(c => c.id === cellId ? { ...c, imageUrl: fileUrl } : c) } : r) });
    } finally { setUploadingCell(null); }
  }
  function biuClearImage(rowId: string, cellId: string) {
    biuSave({ rows: biu.rows.map(r => r.id === rowId ? { ...r, cells: r.cells.map(c => c.id === cellId ? { ...c, imageUrl: null } : c) } : r) });
  }

  const allBiuImages = useMemo(() =>
    biu.rows.flatMap(row => row.cells.filter(c => c.imageUrl).map(c => c.imageUrl as string)),
    [biu.rows]
  );

  function openLightbox(imageUrl: string) {
    const idx = allBiuImages.indexOf(imageUrl);
    setLightboxIdx(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  }

  function navigate(id: string) {
    setActivePage(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }

  function goBack() {
    if (window.history.length > 1) router.back(); else router.push('/');
  }

  const pageIdx = NAV.findIndex(n => n.id === activePage);
  const prev = NAV[pageIdx - 1] ?? null;
  const next = NAV[pageIdx + 1] ?? null;

  return (
    <div className="flex-1 flex">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[210px] bg-white border-r border-[#EBEBEB] z-20 overflow-y-auto">
        <div className="px-6 py-7 border-b border-[#EBEBEB]">
          <Link href="/">
            <Image src="/workiom-logo.png" alt="Workiom" width={100} height={28} className="h-7 w-auto object-contain" unoptimized />
          </Link>
        </div>
        <nav className="flex-1 py-2">
          {NAV.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(s.id)}
              className={cn(
                'w-full flex items-center gap-3 px-6 py-3 text-left transition-all',
                activePage === s.id
                  ? 'text-slate-900 bg-slate-50 border-r-[3px] border-[#9635F0] font-semibold'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50/70',
              )}
            >
              <span className="text-[10px] font-mono text-slate-300 w-5 flex-shrink-0">{s.num}</span>
              <span className="text-[13px]">{s.label}</span>
            </button>
          ))}
        </nav>
        <div className="px-6 py-5 border-t border-[#EBEBEB]">
          <a href="https://workiom.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-900 transition-colors">
            Go to Website <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </aside>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 w-64 bg-white flex flex-col h-full shadow-2xl">
            <div className="px-6 py-6 border-b border-[#EBEBEB] flex items-center justify-between">
              <Link href="/">
                <Image src="/workiom-logo.png" alt="Workiom" width={90} height={24} className="h-6 w-auto object-contain" unoptimized />
              </Link>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex-1 py-3">
              {NAV.map((s) => (
                <button key={s.id} onClick={() => navigate(s.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-6 py-3.5 text-left transition-colors',
                    activePage === s.id ? 'text-slate-900 bg-slate-50 font-semibold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50',
                  )}>
                  <span className="text-[10px] font-mono text-slate-300">{s.num}</span>
                  <span className="text-sm">{s.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 lg:pl-[210px] min-w-0">

        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-5 py-3 bg-white border-b border-[#EBEBEB]">
          <button onClick={() => setMobileOpen(true)} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
            <Menu className="h-4 w-4" />
            <span className="text-slate-400 text-xs">{NAV.find(n => n.id === activePage)?.num}</span>
            {NAV.find(n => n.id === activePage)?.label}
          </button>
          <div className="flex items-center gap-1">
            {prev && <button onClick={() => navigate(prev.id)} className="p-1.5 text-slate-400 hover:text-slate-900"><ChevronLeft className="h-4 w-4" /></button>}
            {next && <button onClick={() => navigate(next.id)} className="p-1.5 text-slate-400 hover:text-slate-900"><ChevronRight className="h-4 w-4" /></button>}
          </div>
        </div>

        {/* ════════════════════════════════════════
            01 · Introduction
        ════════════════════════════════════════ */}
        {activePage === 'introduction' && (
          <section>
            {/* Hero */}
            <div
              className="relative flex flex-col justify-end px-5 sm:px-10 md:px-16 pb-10 sm:pb-12 overflow-hidden"
              style={{ minHeight: '220px', background: 'linear-gradient(135deg, #231F61 0%, #360C73 55%, #9635F0 100%)' }}
            >
              <button onClick={goBack} className="absolute top-5 left-5 sm:left-10 md:left-16 flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-tight tracking-tight pt-14">
                Workiom<br className="sm:hidden" /> Brand Guidelines
              </h1>
              <p className="absolute bottom-5 right-5 sm:right-10 text-xs text-white/30">Version 1.0 · May 2026</p>
              <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-[#FDBC0B]/8 blur-3xl pointer-events-none" />
            </div>

            {/* Intro */}
            <div className="group relative px-5 sm:px-10 md:px-16 py-10 sm:py-14 border-b border-[#EDEDED]">
              <div className="absolute top-5 right-5 sm:right-8"><CopyLLMButton text={LLM.full} /></div>
              <p className="text-base sm:text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl">
                Welcome to the Workiom Visual Identity Guidelines. Here you&apos;ll find everything needed to keep the brand consistent — logo, colors, typography, and more — across every surface, digital or print.
              </p>
            </div>

            {/* Overview tiles */}
            <div className="px-5 sm:px-10 md:px-16 py-8 sm:py-12 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-[#EDEDED]">
              <div className="aspect-square rounded-2xl flex items-center justify-center p-4 sm:p-6" style={{ background: 'linear-gradient(135deg, #3C84FD, #9635F0)' }}>
                <p className="text-white font-semibold text-center text-xs sm:text-sm leading-snug">Transforming ideas into workflows</p>
              </div>
              <div className="aspect-square rounded-2xl flex items-center justify-center p-4 bg-[#231F61]">
                <Image src="/workiom-logo.png" alt="Workiom" width={110} height={30} className="w-4/5 h-auto brightness-0 invert" unoptimized />
              </div>
              <div className="aspect-square rounded-2xl flex items-center justify-center bg-[#F4F4F4] overflow-hidden">
                <span className="text-[52px] sm:text-[72px] font-black leading-none tracking-tighter select-none" style={{ fontFamily: "'General Sans', sans-serif", color: 'rgba(150, 53, 240, 0.45)' }}>Aa</span>
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden flex flex-col">
                {['#9635F0', '#3C84FD', '#FDBC0B', '#360C73'].map((c) => (
                  <div key={c} className="flex-1" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            {/* Quick-jump grid */}
            <div className="px-5 sm:px-10 md:px-16 py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NAV.filter(n => n.id !== 'introduction').map(s => (
                <button
                  key={s.id}
                  onClick={() => navigate(s.id)}
                  className="flex items-center justify-between px-6 py-4 rounded-xl border border-[#EAEAEA] hover:border-[#9635F0]/50 hover:bg-slate-50/60 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-300">{s.num}</span>
                    <span className="text-sm font-semibold text-slate-700">{s.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#9635F0] transition-colors" />
                </button>
              ))}
            </div>

            <PageNav prev={prev} next={next} onNavigate={navigate} />
          </section>
        )}

        {/* ════════════════════════════════════════
            02 · Logo
        ════════════════════════════════════════ */}
        {activePage === 'logo' && (
          <section>
            <SectionBanner title="Logo" />

            <div className="group relative px-5 sm:px-10 md:px-16 pt-10 pb-16 space-y-10">
              <div className="absolute top-4 right-5 sm:right-8"><CopyLLMButton text={LLM.logo} /></div>

              {/* Wordmark on light / dark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group/logo rounded-2xl bg-[#F7F7F7] border border-[#EAEAEA] flex flex-col items-center justify-center gap-4 min-h-[140px] sm:min-h-[180px] p-8 sm:p-10">
                  <Image src="/workiom-logo.png" alt="Workiom on light" width={200} height={52} className="h-10 sm:h-12 w-auto max-w-full object-contain" unoptimized />
                  <LogoActions src="/workiom-logo.png" filename="workiom-logo.png" />
                </div>
                <div className="group/logo rounded-2xl flex flex-col items-center justify-center gap-4 min-h-[140px] sm:min-h-[180px] p-8 sm:p-10" style={{ background: 'linear-gradient(135deg, #231F61 0%, #360C73 100%)' }}>
                  <Image src="/workiom-logo.png" alt="Workiom on dark" width={200} height={52} className="h-10 sm:h-12 w-auto max-w-full object-contain brightness-0 invert" unoptimized />
                  <LogoActions src="/workiom-logo.png" filename="workiom-logo-white.png" dark />
                </div>
              </div>

              {/* Color usage */}
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-4">Color usage</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { bg: '#FFFFFF', border: true,  label: 'On White',      src: '/workiom-logo.png',                  filename: 'workiom-logo.png',       filter: '',                    dark: false },
                    { bg: '#F4F4F4', border: false, label: 'On Light Gray', src: '/workiom-logo.png',                  filename: 'workiom-logo.png',       filter: '',                    dark: false },
                    { bg: '#9635F0', border: false, label: 'On Purple',     src: '/workiom-logo.png',                  filename: 'workiom-logo-white.png', filter: 'brightness-0 invert', dark: true  },
                    { bg: '#231F61', border: false, label: 'On Navy',       src: '/api/file/6a20ccff001498d2577c?v=2', filename: 'workiom-logo-navy.png',  filter: '',                    dark: true  },
                  ].map((v) => (
                    <div key={v.label} className="group/logo rounded-xl flex flex-col items-center justify-center gap-3 py-7 sm:py-8 px-3 sm:px-4"
                      style={{ backgroundColor: v.bg, border: v.border ? '1px solid #EAEAEA' : undefined }}>
                      <Image src={v.src} alt={`Workiom logo ${v.label}`} width={110} height={30}
                        className={cn('h-6 sm:h-7 w-auto max-w-full object-contain', v.filter)} unoptimized />
                      <p className={cn('text-[10px] sm:text-[11px] font-medium text-center', v.dark ? 'text-white/50' : 'text-slate-400')}>{v.label}</p>
                      <LogoActions src={v.src} filename={v.filename} dark={v.dark} />
                    </div>
                  ))}
                </div>
              </div>

              {/* DO */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">✓</span>
                  DO
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#F7F7F7] border border-[#EAEAEA] flex flex-col items-center justify-center gap-2 py-6 px-6">
                    <Image src="/workiom-logo.png" alt="Correct on white" width={140} height={36} className="h-7 w-auto object-contain" unoptimized />
                    <p className="text-[11px] text-slate-400">Correct proportions on white</p>
                  </div>
                  <div className="rounded-xl flex flex-col items-center justify-center gap-2 py-6 px-6" style={{ background: 'linear-gradient(135deg, #231F61, #360C73)' }}>
                    <Image src="/workiom-logo.png" alt="Correct on dark" width={140} height={36} className="h-7 w-auto object-contain brightness-0 invert" unoptimized />
                    <p className="text-[11px] text-white/50">White version on dark background</p>
                  </div>
                </div>
              </div>

              {/* DON'T */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold">✕</span>
                  DON&apos;T
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {([
                    { label: 'Stretched',       imgStyle: { transform: 'scaleX(1.9)'   },               bgStyle: { backgroundColor: '#F9F9F9' } },
                    { label: 'Skewed',          imgStyle: { transform: 'skewX(-22deg)' },               bgStyle: { backgroundColor: '#F9F9F9' } },
                    { label: 'Squished',        imgStyle: { transform: 'scaleY(0.4)'   },               bgStyle: { backgroundColor: '#F9F9F9' } },
                    { label: 'Tilted',          imgStyle: { transform: 'rotate(18deg)' },               bgStyle: { backgroundColor: '#F9F9F9' } },
                    { label: 'Mirrored',        imgStyle: { transform: 'scaleX(-1)'    },               bgStyle: { backgroundColor: '#F9F9F9' } },
                    { label: 'Glow effect',     imgStyle: { filter: 'drop-shadow(0 0 6px #9635F0) drop-shadow(0 0 12px #3C84FD)' }, bgStyle: { backgroundColor: '#F9F9F9' } },
                    { label: 'Over a pattern',  imgStyle: {},                                           bgStyle: { background: 'repeating-linear-gradient(45deg, #d9d9d9 0px, #d9d9d9 2px, #f5f5f5 2px, #f5f5f5 14px)' } },
                    { label: 'Textured bg',     imgStyle: {},                                           bgStyle: { background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px), #e8e8e8' } },
                    { label: 'Photo bg',        imgStyle: {},                                           bgStyle: { background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' } },
                    { label: 'Colored bg',      imgStyle: { filter: 'brightness(0) invert(1)' },        bgStyle: { backgroundColor: '#E53E3E' }, dark: true },
                    { label: 'Keyline',         imgStyle: {},                                           bgStyle: { backgroundColor: '#F9F9F9' }, keyline: true },
                    { label: 'Altered colors',  imgStyle: { filter: 'hue-rotate(140deg) saturate(1.5)' }, bgStyle: { backgroundColor: '#F9F9F9' } },
                  ] as Array<{ label: string; imgStyle: React.CSSProperties; bgStyle: React.CSSProperties; dark?: boolean; keyline?: boolean }>)
                    .map(({ label, imgStyle, bgStyle, dark, keyline }) => (
                      <div key={label} className="rounded-xl flex flex-col items-center justify-center gap-2 py-5 px-3" style={bgStyle}>
                        <div className="h-14 sm:h-16 w-full flex items-center justify-center">
                          {keyline ? (
                            <span style={{ display: 'inline-flex', border: '1.5px solid #9635F0', borderRadius: '4px', padding: '3px' }}>
                              <Image src="/workiom-logo.png" alt={label} width={72} height={20} className="h-3.5 sm:h-4 w-auto object-contain" unoptimized />
                            </span>
                          ) : (
                            <Image src="/workiom-logo.png" alt={label} width={80} height={22}
                              className="h-4 sm:h-5 w-auto object-contain flex-shrink-0"
                              style={imgStyle} unoptimized />
                          )}
                        </div>
                        <p className={cn('text-[9px] sm:text-[10px] font-medium text-center leading-tight', dark ? 'text-white/70' : 'text-red-400')}>{label}</p>
                      </div>
                    ))
                  }
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 pt-3 border-t border-[#EAEAEA]">
                  {[
                    'Stretch, skew, squish, or distort the logo',
                    'Tilt, rotate, or mirror / flip the logo',
                    'Add glow, shadows, outlines, strokes, or effects',
                    'Use a keyline or stroke around the logo',
                    'Alter or change the brand colors',
                    'Place on a pattern, textured, or photo background',
                    'Place on a clashing or unbranded colored background',
                    'Change the proportions between the logotype and the mark',
                    'Place the logo over the icon mark itself',
                    'Contain the logo inside a photo or place it on top of an object',
                    'Use unofficial colors on the mark',
                    'Recreate the logo in a different typeface',
                  ].map((s) => (
                    <li key={s} className="flex items-start gap-2 text-[11px] text-red-500/80">
                      <span className="mt-0.5 flex-shrink-0 text-red-400">✕</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <PageNav prev={prev} next={next} onNavigate={navigate} />
          </section>
        )}

        {/* ════════════════════════════════════════
            03 · Typography
        ════════════════════════════════════════ */}
        {activePage === 'typography' && (
          <section>
            <SectionBanner title="Typography" />

            <div className="group relative px-5 sm:px-10 md:px-16 pt-10 pb-16 space-y-10">
              <div className="absolute top-4 right-5 sm:right-8"><CopyLLMButton text={LLM.typography} /></div>

              {/* ── General Sans ── */}
              <div className="space-y-4">
                <div
                  className="rounded-2xl bg-[#F7F7F7] border border-[#EAEAEA] px-6 sm:px-10 py-7 sm:py-8"
                  style={{ fontFamily: "'General Sans', sans-serif" }}
                >
                  <p className="text-xs font-semibold text-slate-400">Latin / English</p>
                  <p className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-3">General Sans</p>
                  <p className="text-sm text-slate-400 mt-1.5">For all Latin and English text</p>
                  <p className="text-xs text-slate-300 mt-3 tracking-wide">LIGHT · REGULAR · MEDIUM · SEMIBOLD · BOLD</p>
                </div>

                <div className="border border-[#EAEAEA] rounded-2xl overflow-hidden divide-y divide-[#EAEAEA]" style={{ fontFamily: "'General Sans', sans-serif" }}>
                  {[
                    { w: 700, label: 'Bold',     sample: 'Workiom AI will do the work' },
                    { w: 600, label: 'SemiBold', sample: 'Transforming ideas into workflows' },
                    { w: 500, label: 'Medium',   sample: 'Build, automate, and scale operations' },
                    { w: 400, label: 'Regular',  sample: 'A future where every team creates the software they need' },
                    { w: 300, label: 'Light',    sample: 'Minimal, modern, product-focused, spacious' },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-4 sm:gap-6 px-5 sm:px-8 py-4 sm:py-5 bg-white hover:bg-[#FAFAFA] transition-colors">
                      <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 w-16 sm:w-20 flex-shrink-0">{r.label}</span>
                      <p className="text-slate-800 truncate text-base sm:text-xl leading-tight" style={{ fontWeight: r.w }}>{r.sample}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── IBM Plex Sans Arabic ── */}
              <div className="space-y-4">
                <div
                  className="rounded-2xl bg-[#F7F7F7] border border-[#EAEAEA] px-6 sm:px-10 py-7 sm:py-8"
                  dir="rtl"
                  style={{ fontFamily: 'var(--font-ibm-plex-arabic)' }}
                >
                  <p className="text-xs font-semibold text-slate-400 text-right">عربي / Arabic</p>
                  <p className="text-3xl sm:text-4xl font-bold text-slate-900 text-right mt-3">IBM Plex Sans Arabic</p>
                  <p className="text-sm text-slate-400 mt-1.5 text-right">للنصوص العربية في كل مكان</p>
                  <p className="text-xs text-slate-300 mt-3 tracking-wide text-right">لايت · ريغيولار · ميديوم · سيميبولد · بولد</p>
                </div>

                <div className="border border-[#EAEAEA] rounded-2xl overflow-hidden divide-y divide-[#EAEAEA]" dir="rtl"
                  style={{ fontFamily: 'var(--font-ibm-plex-arabic)' }}>
                  {[
                    { w: 700, sample: 'استفد الآن من ميزات الذكاء الاصطناعي' },
                    { w: 500, sample: 'أنشئ سير العمل وأتمتها بسهولة تامة' },
                    { w: 400, sample: 'منصة عمل ذكية وقابلة للتخصيص لكل فريق' },
                    { w: 300, sample: 'بسيطة وعصرية ومركزة على المنتج' },
                  ].map((r) => (
                    <div key={r.w} className="px-5 sm:px-8 py-4 sm:py-5 bg-white hover:bg-[#FAFAFA] transition-colors">
                      <p className="text-slate-800 text-base sm:text-xl text-right leading-relaxed" style={{ fontWeight: r.w }}>{r.sample}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <PageNav prev={prev} next={next} onNavigate={navigate} />
          </section>
        )}

        {/* ════════════════════════════════════════
            04 · Color
        ════════════════════════════════════════ */}
        {activePage === 'color' && (
          <section>
            <SectionBanner title="Color" />

            <div className="group relative px-5 sm:px-10 md:px-16 pt-10 pb-16 space-y-4">
              <div className="absolute top-4 right-5 sm:right-8"><CopyLLMButton text={LLM.colors} /></div>

              <p className="text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed pb-4">
                Our palette combines vibrant purples and blues with a bold yellow accent, grounded by clean neutrals.
              </p>

              <ColorSwatch name="Workiom Purple" hex="#9635F0" rgb="150, 53, 240" tall />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <ColorSwatch name="Blue"        hex="#3C84FD" rgb="60, 132, 253" />
                <ColorSwatch name="Dark Purple" hex="#360C73" rgb="54, 12, 115" />
                <ColorSwatch name="Violet"      hex="#8201AD" rgb="130, 1, 173" />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <ColorSwatch name="Yellow"     hex="#FDBC0B" rgb="253, 188, 11" />
                <ColorSwatch name="Light Gray" hex="#D9D9D9" rgb="217, 217, 217" light />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <ColorSwatch name="Black" hex="#000000" rgb="0, 0, 0" />
                <ColorSwatch name="White" hex="#FFFFFF" rgb="255, 255, 255" light />
              </div>
            </div>

            <PageNav prev={prev} next={next} onNavigate={navigate} />
          </section>
        )}

        {/* ════════════════════════════════════════
            05 · Brand in Use
        ════════════════════════════════════════ */}
        {activePage === 'brand-in-use' && (
          <section>
            <SectionBanner title="Brand in Use" />

            <div className="px-5 sm:px-10 md:px-16 pt-10 pb-16">
              <div className="flex items-start justify-between gap-4 mb-8">
                <p className="text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed">
                  Workiom&apos;s visual identity applied across real touchpoints — digital products, marketing, presentations, and print.
                </p>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {saving && <span className="text-[11px] text-slate-400 animate-pulse">Saving…</span>}
                  {editUser && (
                    <button
                      onClick={() => setEditMode(m => !m)}
                      className={cn(
                        'inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors',
                        editMode ? 'bg-[#9635F0] text-white hover:bg-[#8028d8]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                      )}
                    >
                      {editMode ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                      {editMode ? 'Done' : 'Edit'}
                    </button>
                  )}
                </div>
              </div>

              {biuLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-slate-300 animate-spin" />
                </div>
              ) : biu.rows.length === 0 && !editMode ? (
                <div className="h-48 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#EAEAEA] rounded-2xl">
                  <p className="text-sm text-slate-400">No images added yet.</p>
                  {editUser && (
                    <button onClick={() => setEditMode(true)} className="text-xs font-semibold text-[#9635F0] hover:underline">
                      Start adding images →
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={biu.rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
                      {biu.rows.map(row => (
                        <SortableBiuRow
                          key={row.id}
                          row={row}
                          editMode={editMode}
                          uploadingCell={uploadingCell}
                          onAddCell={biuAddCell}
                          onRemoveCell={biuRemoveCell}
                          onRemoveRow={biuRemoveRow}
                          onUpload={biuUpload}
                          onClearImage={biuClearImage}
                          onOpenLightbox={openLightbox}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>

                  {editMode && (
                    <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-[#EAEAEA]">
                      <span className="text-xs font-semibold text-slate-400">Add row:</span>
                      {[1, 2, 3, 4].map(n => (
                        <button key={n} onClick={() => biuAddRow(n)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#EAEAEA] text-slate-600 hover:border-[#9635F0] hover:text-[#9635F0] hover:bg-[#9635F0]/5 transition-all">
                          <Plus className="h-3 w-3" />{n} {n === 1 ? 'column' : 'columns'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!biuLoading && biu.rows.length === 0 && editMode && (
                <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#EAEAEA] mt-4">
                  <span className="text-xs font-semibold text-slate-400">Add first row:</span>
                  {[1, 2, 3, 4].map(n => (
                    <button key={n} onClick={() => biuAddRow(n)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#EAEAEA] text-slate-600 hover:border-[#9635F0] hover:text-[#9635F0] hover:bg-[#9635F0]/5 transition-all">
                      <Plus className="h-3 w-3" />{n} {n === 1 ? 'column' : 'columns'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <PageNav prev={prev} next={next} onNavigate={navigate} />
          </section>
        )}

        {/* ════════════════════════════════════════
            06 · Resources
        ════════════════════════════════════════ */}
        {activePage === 'resources' && (
          <section>
            <SectionBanner title="Resources" />

            <div className="px-5 sm:px-10 md:px-16 pt-10 pb-16 space-y-8 sm:space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Logo Assets',           desc: 'Workiom logo in SVG, PNG, and JPG across all color variants.' },
                  { title: 'Color Palette',          desc: 'Swatches for all brand colors in HEX, RGB, CMYK, and Pantone.' },
                  { title: 'Typography',             desc: 'General Sans and IBM Plex Sans Arabic font files.' },
                  { title: 'Icon Library',           desc: 'Workiom product icons for digital and marketing use.' },
                  { title: 'Presentation Template',  desc: 'Keynote and PowerPoint master slides with brand styles.' },
                  { title: 'Social Templates',       desc: 'Formatted templates for LinkedIn, Instagram, and X.' },
                ].map((r) => (
                  <div key={r.title} className="border border-[#EAEAEA] rounded-2xl p-5 sm:p-7 bg-white hover:border-[#9635F0]/40 transition-colors">
                    <p className="text-sm font-semibold text-slate-900 mb-2">{r.title}</p>
                    <p className="text-sm text-slate-400 leading-relaxed mb-5">{r.desc}</p>
                    <Link href="/browse" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-[#9635F0] transition-colors">
                      Browse Assets <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl px-6 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                style={{ background: 'linear-gradient(135deg, #231F61 0%, #360C73 55%, #9635F0 100%)' }}>
                <div>
                  <p className="text-lg sm:text-xl font-semibold text-white mb-1">Need help applying the Workiom brand?</p>
                  <p className="text-white/50 text-sm">Contact the brand team for guidance, approvals, or custom assets.</p>
                </div>
                <a href="mailto:brand@workiom.com"
                  className="flex-shrink-0 inline-flex items-center px-5 sm:px-6 py-3 bg-white text-slate-900 text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors">
                  Contact Brand Team
                </a>
              </div>
            </div>

            <PageNav prev={prev} next={next} onNavigate={navigate} />
          </section>
        )}

        {/* Footer — always visible */}
        <footer className="px-5 sm:px-10 md:px-16 py-10 sm:py-12" style={{ background: 'linear-gradient(135deg, #231F61 0%, #360C73 55%, #9635F0 100%)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-white/20">
            <div>
              <p className="text-xs font-semibold text-white mb-1">Visual Identity Guidelines</p>
              <p className="text-[10px] text-white">Version 1.0</p>
            </div>
            <p className="text-xs text-white">brand@workiom.com</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 sm:pt-8">
            <div className="flex items-center gap-3">
              <Image src="/workiom-icon.png" alt="Workiom" width={32} height={32} className="h-8 w-8 object-contain brightness-0 invert" unoptimized />
              <span className="text-[11px] text-white">© 2026 Workiom. All rights reserved.</span>
            </div>
            <p className="flex items-center gap-1.5 text-[11px] text-white">
              Made with <Heart className="h-3 w-3 text-red-300 fill-red-300" /> by{' '}
              <a href="https://diginsider.net" target="_blank" rel="noopener noreferrer"
                className="text-white underline underline-offset-2 hover:text-white/80 transition-colors">Insider</a>
            </p>
          </div>
        </footer>

      </main>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIdx}
        slides={allBiuImages.map(src => ({ src }))}
        styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' } }}
      />
    </div>
  );
}
