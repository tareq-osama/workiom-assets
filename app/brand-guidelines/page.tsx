'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Copy, Download, ExternalLink, Menu, X, ArrowLeft, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────
   Navigation
───────────────────────────────────────────── */
const NAV = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'logo',         label: 'Logo' },
  { id: 'typography',   label: 'Typography' },
  { id: 'color',        label: 'Color' },
  { id: 'resources',    label: 'Resources' },
];

/* ─────────────────────────────────────────────
   LLM copy payloads
───────────────────────────────────────────── */
const LLM = {
  full: `Workiom Brand Guide
──────────────────────
Brand: Workiom
Category: AI-powered work management & no-code platform

Positioning:
Workiom helps teams automate workflows, build internal tools, manage operations, and turn ideas into working systems faster. Minimal, modern, product-focused.

Colors:
• Workiom Purple  #9635F0  RGB(150,53,240)   — primary brand color
• Blue            #3C84FD  RGB(60,132,253)   — secondary / CTAs
• Dark Purple     #360C73  RGB(54,12,115)    — deep accent
• Violet          #8201AD  RGB(130,1,173)    — accent
• Yellow          #FDBC0B  RGB(253,188,11)   — highlight / warning
• Light Gray      #D9D9D9  RGB(217,217,217)  — neutral
• Black #000000 / White #FFFFFF

Primary gradient:  linear-gradient(135deg, #360C73 0%, #8201AD 45%, #9635F0 100%)
Dark gradient:     linear-gradient(135deg, #231F61 0%, #360C73 55%, #9635F0 100%)

Typography:
• Latin/English: General Sans (Bold, SemiBold, Medium, Regular, Light)
• Arabic:        IBM Plex Sans Arabic

Mission: Help modern teams build, automate, and scale without complexity.
Vision:  A future where every team creates the software they need.`,

  logo: `Workiom Logo Usage Guidelines
──────────────────────────────
DO:
✓ Use on white or very light backgrounds
✓ Maintain clear space (at least icon height) around the logo
✓ Use SVG format for all digital outputs
✓ Use the white/inverted version on dark/purple backgrounds
✓ Use the icon-only mark for app icons and small contexts

DON'T:
✕ Stretch, skew, squish, or distort the logo
✕ Tilt, rotate, or mirror / flip the logo
✕ Add glow, shadows, outlines, strokes, or effects
✕ Use a keyline or stroke around the logo
✕ Alter or change the brand colors
✕ Place on a pattern, textured, or photo background
✕ Place on a clashing or unbranded colored background
✕ Change the proportions between the logotype and the mark
✕ Place the logo over the icon mark itself
✕ Contain the logo inside a photo or place it on top of an object
✕ Use unofficial colors on the mark
✕ Recreate the logo in a different typeface

Available formats: SVG (preferred), PNG, JPG`,

  typography: `Workiom Typography
──────────────────
Primary font (Latin/English): General Sans
Weights: Light · Regular · Medium · SemiBold · Bold

Arabic font: IBM Plex Sans Arabic
Arabic specimen: استفد الآن من ميزات الذكاء الاصطناعي`,

  colors: `Workiom Brand Colors
────────────────────
Primary:
• Workiom Purple  #9635F0  RGB(150,53,240)
• Blue            #3C84FD  RGB(60,132,253)

Extended palette:
• Dark Purple     #360C73  RGB(54,12,115)
• Violet          #8201AD  RGB(130,1,173)
• Yellow Accent   #FDBC0B  RGB(253,188,11)
• Light Gray      #D9D9D9  RGB(217,217,217)
• Black           #000000
• White           #FFFFFF

Gradients:
Primary:  linear-gradient(135deg, #360C73 0%, #8201AD 45%, #9635F0 100%)
Dark:     linear-gradient(135deg, #231F61 0%, #360C73 55%, #9635F0 100%)`,
};

/* ─────────────────────────────────────────────
   Helper components
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
        className
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
      className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors whitespace-nowrap opacity-0 group-hover/swatch:opacity-100 transition-opacity duration-150"
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
    try {
      await navigator.clipboard.writeText(window.location.origin + src);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }
  const base = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-colors';
  const cls = dark
    ? cn(base, 'text-white/80 border-white/20 bg-white/10 hover:bg-white/20')
    : cn(base, 'text-slate-600 border-[#EAEAEA] bg-white hover:bg-slate-50');
  return (
    <div className="flex items-center gap-1.5 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-150">
      <a href={src} download={filename} className={cls}>
        <Download className="h-2.5 w-2.5" />
        Download
      </a>
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
      className="h-44 sm:h-52 flex items-end px-10 sm:px-16 pb-10"
      style={{ background: 'linear-gradient(135deg, #231F61 0%, #360C73 55%, #9635F0 100%)' }}
    >
      <h2 className="text-4xl sm:text-5xl font-semibold text-white leading-none tracking-tight">{title}</h2>
    </div>
  );
}

function ColorSwatch({
  name, hex, rgb, light, tall,
}: { name: string; hex: string; rgb: string; light?: boolean; tall?: boolean }) {
  const textCls = light ? 'text-slate-600' : 'text-white';
  return (
    <div
      className={cn('relative rounded-xl overflow-hidden group/swatch', tall ? 'min-h-48 sm:min-h-56' : 'min-h-28')}
      style={{ backgroundColor: hex, border: light ? '1px solid #EAEAEA' : undefined }}
    >
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className={cn('text-xs font-semibold mb-1 opacity-60', textCls)}>{name}</p>
        <p className={cn('text-sm font-mono font-bold', textCls)}>{hex}</p>
        <p className={cn('text-xs font-mono opacity-40', textCls)}>RGB {rgb}</p>
      </div>
      <div className="absolute top-3 right-3">
        <ColorCopyButton hex={hex} name={name} rgb={rgb} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function BrandGuidelinesPage() {
  const router = useRouter();
  const [active, setActive] = useState('introduction');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const obs: IntersectionObserver[] = [];
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActive(id); },
        { rootMargin: '-15% 0px -60% 0px' }
      );
      o.observe(el);
      obs.push(o);
    });
    return () => obs.forEach((o) => o.disconnect());
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  }

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }

  return (
    <div className="flex-1 flex">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[210px] bg-white border-r border-[#EBEBEB] z-20 overflow-y-auto">
        <div className="px-6 py-7 border-b border-[#EBEBEB]">
          <Image src="/workiom-logo.png" alt="Workiom" width={100} height={28} className="h-7 w-auto object-contain" unoptimized />
        </div>

        <nav className="flex-1 py-3">
          {NAV.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={cn(
                'w-full flex items-center px-6 py-3 text-left transition-all',
                active === s.id
                  ? 'text-slate-900 bg-slate-50 border-r-[3px] border-[#9635F0] font-semibold'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50/70'
              )}
            >
              <span className="text-[13px]">{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-[#EBEBEB]">
          <a
            href="https://workiom.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-900 transition-colors"
          >
            Go to Website <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 w-64 bg-white flex flex-col h-full shadow-2xl">
            <div className="px-6 py-6 border-b border-[#EBEBEB] flex items-center justify-between">
              <Image src="/workiom-logo.png" alt="Workiom" width={90} height={24} className="h-6 w-auto object-contain" unoptimized />
              <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 py-3">
              {NAV.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="w-full flex items-center px-6 py-3 text-left text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-medium">{s.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 lg:pl-[210px] min-w-0">

        {/* Mobile section nav */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-5 py-3 bg-white border-b border-[#EBEBEB]">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <Menu className="h-4 w-4" /> Sections
          </button>
        </div>

        {/* ── Introduction ── */}
        <section id="introduction">
          {/* Hero */}
          <div
            className="relative h-72 sm:h-80 flex flex-col justify-end px-10 sm:px-16 pb-12 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #231F61 0%, #360C73 55%, #9635F0 100%)' }}
          >
            <button
              onClick={goBack}
              className="absolute top-6 left-10 sm:left-16 flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-none tracking-tight whitespace-nowrap">
              Workiom Brand Guidelines
            </h1>
            <p className="absolute bottom-10 right-10 sm:right-16 text-xs text-white/30">Version 1.0  ·  May 2026</p>
            <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-[#FDBC0B]/8 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-20 w-48 h-48 rounded-full bg-[#3C84FD]/10 blur-2xl pointer-events-none" />
          </div>

          {/* Intro paragraph */}
          <div className="group relative px-10 sm:px-16 py-14 border-b border-[#EDEDED]">
            <div className="absolute top-5 right-8">
              <CopyLLMButton text={LLM.full} />
            </div>
            <p className="text-lg sm:text-xl text-slate-500 leading-relaxed max-w-2xl">
              Welcome to the Workiom Visual Identity Guidelines. Here you'll find everything needed to keep the brand consistent — logo, colors, typography, and more — across every surface, digital or print.
            </p>
          </div>

          {/* Overview tiles */}
          <div className="px-10 sm:px-16 py-12 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-[#EDEDED]">
            <div className="aspect-square rounded-2xl flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #3C84FD, #9635F0)' }}>
              <p className="text-white font-semibold text-center text-sm leading-snug">Transforming ideas into workflows</p>
            </div>
            <div className="aspect-square rounded-2xl flex items-center justify-center p-6 bg-[#231F61]">
              <Image src="/workiom-logo.png" alt="Workiom" width={110} height={30} className="w-[80%] h-auto brightness-0 invert" unoptimized />
            </div>
            <div className="aspect-square rounded-2xl flex items-center justify-center bg-[#F4F4F4] overflow-hidden">
              <span className="text-[72px] font-black text-slate-200 leading-none tracking-tighter select-none">Aa</span>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden flex flex-col">
              {['#9635F0', '#3C84FD', '#FDBC0B', '#360C73'].map((c) => (
                <div key={c} className="flex-1" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Logo ── */}
        <section id="logo" className="border-t border-[#EDEDED]">
          <SectionBanner title="Logo" />

          <div className="group relative px-10 sm:px-16 pt-12 pb-20 space-y-10">
            <div className="absolute top-4 right-8">
              <CopyLLMButton text={LLM.logo} />
            </div>

            {/* Wordmark on light / dark — downloadable */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="group/logo rounded-2xl bg-[#F7F7F7] border border-[#EAEAEA] flex flex-col items-center justify-center gap-4 min-h-[180px] p-10">
                <Image src="/workiom-logo.png" alt="Workiom wordmark on light" width={220} height={56} className="h-12 w-auto max-w-full object-contain" unoptimized />
                <LogoActions src="/workiom-logo.png" filename="workiom-logo.png" />
              </div>
              <div className="group/logo rounded-2xl flex flex-col items-center justify-center gap-4 min-h-[180px] p-10" style={{ background: 'linear-gradient(135deg, #231F61 0%, #360C73 100%)' }}>
                <Image src="/workiom-logo.png" alt="Workiom wordmark on dark" width={220} height={56} className="h-12 w-auto max-w-full object-contain brightness-0 invert" unoptimized />
                <LogoActions src="/workiom-logo.png" filename="workiom-logo-white.png" dark />
              </div>
            </div>

            {/* Color usage */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-4">Color usage</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { bg: '#FFFFFF', border: true,  label: 'On White',      src: '/workiom-logo.png',                  filename: 'workiom-logo.png',       filter: '',                    darkLabel: false, dark: false },
                  { bg: '#F4F4F4', border: false, label: 'On Light Gray', src: '/workiom-logo.png',                  filename: 'workiom-logo.png',       filter: '',                    darkLabel: false, dark: false },
                  { bg: '#9635F0', border: false, label: 'On Purple',     src: '/workiom-logo.png',                  filename: 'workiom-logo-white.png', filter: 'brightness-0 invert', darkLabel: true,  dark: true  },
                  { bg: '#231F61', border: false, label: 'On Navy',       src: '/api/file/6a20ccff001498d2577c?v=2', filename: 'workiom-logo-navy.png',  filter: '',                    darkLabel: true,  dark: true  },
                ].map((v) => (
                  <div
                    key={v.label}
                    className="group/logo rounded-xl flex flex-col items-center justify-center gap-4 py-8 px-4"
                    style={{ backgroundColor: v.bg, border: v.border ? '1px solid #EAEAEA' : undefined }}
                  >
                    <Image
                      src={v.src}
                      alt={`Workiom logo ${v.label}`}
                      width={120}
                      height={32}
                      className={cn('h-7 w-auto max-w-full object-contain', v.filter)}
                      unoptimized
                    />
                    <p className={cn('text-[11px] font-medium text-center', v.darkLabel ? 'text-white/50' : 'text-slate-400')}>{v.label}</p>
                    <LogoActions src={v.src} filename={v.filename} dark={v.dark} />
                  </div>
                ))}
              </div>
            </div>

            {/* Do / Don't */}
            <div className="space-y-8">

              {/* ✓ DO */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">✓</span>
                  DO
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#F7F7F7] border border-[#EAEAEA] flex flex-col items-center justify-center gap-2 py-6 px-6">
                    <Image src="/workiom-logo.png" alt="Correct usage on white" width={140} height={36} className="h-7 w-auto object-contain" unoptimized />
                    <p className="text-[11px] text-slate-400">Correct proportions on white</p>
                  </div>
                  <div className="rounded-xl flex flex-col items-center justify-center gap-2 py-6 px-6" style={{ background: 'linear-gradient(135deg, #231F61, #360C73)' }}>
                    <Image src="/workiom-logo.png" alt="Correct usage on dark" width={140} height={36} className="h-7 w-auto object-contain brightness-0 invert" unoptimized />
                    <p className="text-[11px] text-white/50">White version on dark background</p>
                  </div>
                </div>
              </div>

              {/* ✕ DON'T */}
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
                      <div
                        key={label}
                        className="rounded-xl flex flex-col items-center justify-center gap-2 py-5 px-3"
                        style={bgStyle}
                      >
                        {/* h-16 container ensures nothing gets clipped even with rotation/skew */}
                        <div className="h-16 w-full flex items-center justify-center">
                          {keyline ? (
                            <span style={{ display: 'inline-flex', border: '1.5px solid #9635F0', borderRadius: '4px', padding: '3px' }}>
                              <Image src="/workiom-logo.png" alt={label} width={80} height={22} className="h-4 w-auto object-contain" unoptimized />
                            </span>
                          ) : (
                            <Image
                              src="/workiom-logo.png"
                              alt={label}
                              width={90}
                              height={24}
                              className="h-5 w-auto object-contain flex-shrink-0"
                              style={imgStyle}
                              unoptimized
                            />
                          )}
                        </div>
                        <p className={cn('text-[10px] font-medium text-center leading-tight', dark ? 'text-white/70' : 'text-red-400')}>{label}</p>
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
                  ].map((sentence) => (
                    <li key={sentence} className="flex items-start gap-2 text-[11px] text-red-500/80">
                      <span className="mt-0.5 flex-shrink-0 text-red-400">✕</span>
                      {sentence}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* ── Typography ── */}
        <section id="typography" className="border-t border-[#EDEDED]">
          <SectionBanner title="Typography" />

          <div className="group relative px-10 sm:px-16 pt-12 pb-20 space-y-10">
            <div className="absolute top-4 right-8">
              <CopyLLMButton text={LLM.typography} />
            </div>

            {/* General Sans */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#F7F7F7] border border-[#EAEAEA] px-10 py-8 flex flex-col justify-between min-h-[140px]">
                <p className="text-xs font-semibold text-slate-400">Latin / English</p>
                <div className="mt-4">
                  <p className="text-4xl font-bold text-slate-900 tracking-tight">General Sans</p>
                  <p className="text-sm text-slate-400 mt-1.5">For all Latin and English text</p>
                </div>
              </div>

              <div className="border border-[#EAEAEA] rounded-2xl overflow-hidden divide-y divide-[#EAEAEA]">
                {[
                  { w: 700, label: 'Bold',     sample: 'Workiom AI will do the work' },
                  { w: 600, label: 'SemiBold', sample: 'Transforming ideas into workflows' },
                  { w: 500, label: 'Medium',   sample: 'Build, automate, and scale operations' },
                  { w: 400, label: 'Regular',  sample: 'A future where every team creates the software they need' },
                  { w: 300, label: 'Light',    sample: 'Minimal, modern, product-focused, spacious' },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-6 px-8 py-5 bg-white hover:bg-[#FAFAFA] transition-colors">
                    <span className="text-[11px] font-mono text-slate-300 w-20 flex-shrink-0">{r.label}</span>
                    <p className="text-slate-800 truncate text-xl leading-tight" style={{ fontWeight: r.w }}>{r.sample}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* IBM Plex Sans Arabic */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#F7F7F7] border border-[#EAEAEA] px-10 py-8 flex flex-col justify-between min-h-[140px]" dir="rtl">
                <p className="text-xs font-semibold text-slate-400 text-right">عربي / Arabic</p>
                <div className="mt-4">
                  <p className="text-4xl font-bold text-slate-900 text-right">IBM Plex Sans Arabic</p>
                  <p className="text-sm text-slate-400 mt-1.5 text-right">للنصوص العربية في كل مكان</p>
                </div>
              </div>

              <div className="border border-[#EAEAEA] rounded-2xl overflow-hidden divide-y divide-[#EAEAEA]" dir="rtl">
                {[
                  { w: 700, sample: 'استفد الآن من ميزات الذكاء الاصطناعي' },
                  { w: 500, sample: 'أنشئ سير العمل وأتمتها بسهولة تامة' },
                  { w: 400, sample: 'منصة عمل ذكية وقابلة للتخصيص لكل فريق' },
                ].map((r) => (
                  <div key={r.w} className="px-8 py-5 bg-white hover:bg-[#FAFAFA] transition-colors">
                    <p className="text-slate-800 text-xl text-right leading-relaxed" style={{ fontWeight: r.w }}>{r.sample}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ── Color ── */}
        <section id="color" className="border-t border-[#EDEDED]">
          <SectionBanner title="Color" />

          <div className="group relative px-10 sm:px-16 pt-10 pb-20 space-y-4">
            <div className="absolute top-4 right-8">
              <CopyLLMButton text={LLM.colors} />
            </div>

            <p className="text-base text-slate-500 max-w-xl leading-relaxed pb-6">
              Our palette combines vibrant purples and blues with a bold yellow accent, grounded by clean neutrals.
            </p>

            <ColorSwatch name="Workiom Purple" hex="#9635F0" rgb="150, 53, 240" tall />

            <div className="grid grid-cols-3 gap-4">
              <ColorSwatch name="Blue"        hex="#3C84FD" rgb="60, 132, 253" />
              <ColorSwatch name="Dark Purple" hex="#360C73" rgb="54, 12, 115" />
              <ColorSwatch name="Violet"      hex="#8201AD" rgb="130, 1, 173" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ColorSwatch name="Yellow"     hex="#FDBC0B" rgb="253, 188, 11" />
              <ColorSwatch name="Light Gray" hex="#D9D9D9" rgb="217, 217, 217" light />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <ColorSwatch name="Black" hex="#000000" rgb="0, 0, 0" />
              <ColorSwatch name="White" hex="#FFFFFF" rgb="255, 255, 255" light />
            </div>
          </div>
        </section>

        {/* ── Resources ── */}
        <section id="resources" className="border-t border-[#EDEDED]">
          <SectionBanner title="Resources" />

          <div className="px-10 sm:px-16 pt-12 pb-20 space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Logo Assets',            desc: 'Workiom logo in SVG, PNG, and JPG across all color variants.' },
                { title: 'Color Palette',          desc: 'Swatches for all brand colors in HEX, RGB, CMYK, and Pantone.' },
                { title: 'Typography',             desc: 'General Sans and IBM Plex Sans Arabic font files.' },
                { title: 'Icon Library',           desc: 'Workiom product icons for digital and marketing use.' },
                { title: 'Presentation Template',  desc: 'Keynote and PowerPoint master slides with brand styles.' },
                { title: 'Social Templates',       desc: 'Formatted templates for LinkedIn, Instagram, and X.' },
              ].map((r) => (
                <div key={r.title} className="border border-[#EAEAEA] rounded-2xl p-7 bg-white hover:border-[#9635F0]/40 transition-colors">
                  <p className="text-sm font-semibold text-slate-900 mb-2">{r.title}</p>
                  <p className="text-sm text-slate-400 leading-relaxed mb-5">{r.desc}</p>
                  <Link
                    href="/browse"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-[#9635F0] transition-colors"
                  >
                    Browse Assets <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl px-10 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              style={{ background: 'linear-gradient(135deg, #231F61 0%, #360C73 55%, #9635F0 100%)' }}
            >
              <div>
                <p className="text-xl font-semibold text-white mb-1">Need help applying the Workiom brand?</p>
                <p className="text-white/50 text-sm">Contact the brand team for guidance, approvals, or custom assets.</p>
              </div>
              <a
                href="mailto:brand@workiom.com"
                className="flex-shrink-0 inline-flex items-center px-6 py-3 bg-white text-slate-900 text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors"
              >
                Contact Brand Team
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-10 sm:px-16 py-12" style={{ background: 'linear-gradient(135deg, #231F61 0%, #360C73 55%, #9635F0 100%)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-white/20">
            <div>
              <p className="text-xs font-semibold text-white mb-1">Visual Identity Guidelines</p>
              <p className="text-[10px] text-white">Version 1.0</p>
            </div>
            <p className="text-xs text-white">brand@workiom.com</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-8">
            <div className="flex items-center gap-3">
              <Image src="/workiom-icon.png" alt="Workiom" width={20} height={20} className="h-5 w-5 object-contain brightness-0 invert" unoptimized />
              <span className="text-[11px] text-white">© 2026 Workiom. All rights reserved.</span>
            </div>
            <p className="flex items-center gap-1.5 text-[11px] text-white">
              Made with <Heart className="h-3 w-3 text-red-300 fill-red-300" /> by{' '}
              <a
                href="https://diginsider.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline underline-offset-2 hover:text-white/80 transition-colors"
              >
                Insider
              </a>
            </p>
          </div>
        </footer>

      </main>
    </div>
  );
}
