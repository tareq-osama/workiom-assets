'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Copy, ExternalLink, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────
   Navigation
───────────────────────────────────────────── */
const NAV = [
  { id: 'introduction', num: '01', label: 'Introduction' },
  { id: 'strategy',     num: '02', label: 'Strategy' },
  { id: 'logo',         num: '03', label: 'Logo' },
  { id: 'typography',   num: '04', label: 'Typography' },
  { id: 'color',        num: '05', label: 'Color' },
  { id: 'resources',    num: '06', label: 'Resources' },
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
• Dark Purple     #52009F  RGB(82,0,159)     — deep accent
• Violet          #8201AD  RGB(130,1,173)    — accent
• Yellow          #FDBC0B  RGB(253,188,11)   — highlight / warning
• Deep Navy       #231F61  RGB(35,31,97)     — text / backgrounds
• Light Gray      #D9D9D9  RGB(217,217,217)  — neutral
• Black #000000 / White #FFFFFF

Primary gradient:  linear-gradient(135deg, #52009F 0%, #8201AD 45%, #9635F0 100%)
Dark gradient:     linear-gradient(135deg, #231F61 0%, #52009F 55%, #9635F0 100%)

Typography:
• Latin/English: General Sans (Bold, SemiBold, Medium, Regular, Light)
• Arabic:        IBM Plex Sans Arabic

Brand Principles: Clear · Intelligent · Flexible · Human

Mission: Help modern teams build, automate, and scale without complexity.
Vision:  A future where every team creates the software they need.`,

  strategy: `Workiom Brand Strategy
──────────────────────
Brand Essence: "Workflows made simple."

Mission: To help modern teams build, automate, and scale their operations without complexity.
Vision: A future where every team can create the software they need to work better.

Brand Principles:
• Clear       — Simple, direct communication. No jargon.
• Intelligent — Data-informed, purposeful, always precise.
• Flexible    — Adapts to every team's unique way of working.
• Human       — Warm and approachable, never robotic.

Positioning: AI-powered work management and no-code platform. Visual direction: minimal, modern, product-focused, spacious, editorial.`,

  logo: `Workiom Logo Usage Guidelines
──────────────────────────────
DO:
✓ Use on white or very light backgrounds
✓ Maintain clear space (at least icon height) around the logo
✓ Use SVG format for all digital outputs
✓ Use the white/inverted version on dark/purple backgrounds
✓ Use the icon-only mark for app icons and small contexts

DON'T:
✕ Never stretch, skew, or distort the logo
✕ Never place on busy or low-contrast backgrounds
✕ Never recreate in a different typeface
✕ Never add shadows, outlines, glows, or effects
✕ Never use unofficial colors on the mark

Available formats: SVG (preferred), PNG, JPG`,

  typography: `Workiom Typography
──────────────────
Primary font (Latin/English): General Sans
Arabic font: IBM Plex Sans Arabic

Weights: Light · Regular · Medium · SemiBold · Bold

Screen usage chart:
Size       Line Height   Tracking
0–15px     128%          −1%
16–25px    120%          −2%
26–42px    104%          −2%
42–76px    98%           −3%
76px+      96%           −4%

Arabic specimen: استفد الآن من ميزات الذكاء الاصطناعي`,

  colors: `Workiom Brand Colors
────────────────────
Primary:
• Workiom Purple  #9635F0  RGB(150,53,240)
• Blue            #3C84FD  RGB(60,132,253)

Extended palette:
• Dark Purple     #52009F  RGB(82,0,159)
• Violet          #8201AD  RGB(130,1,173)
• Yellow Accent   #FDBC0B  RGB(253,188,11)
• Deep Navy       #231F61  RGB(35,31,97)
• Light Gray      #D9D9D9  RGB(217,217,217)
• Black           #000000
• White           #FFFFFF

Gradients:
Primary:  linear-gradient(135deg, #52009F 0%, #8201AD 45%, #9635F0 100%)
Dark:     linear-gradient(135deg, #231F61 0%, #52009F 55%, #9635F0 100%)`,
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
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold tracking-wide',
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

function SectionBanner({ num, title }: { num: string; title: string }) {
  return (
    <div
      className="h-44 sm:h-52 flex items-end px-10 sm:px-16 pb-10"
      style={{ background: 'linear-gradient(135deg, #231F61 0%, #52009F 55%, #9635F0 100%)' }}
    >
      <div className="flex items-baseline gap-5">
        <span className="text-7xl font-black text-white/15 leading-none tabular-nums">{num}</span>
        <h2 className="text-4xl sm:text-5xl font-bold text-white leading-none tracking-tight">{title}</h2>
      </div>
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

  return (
    <div className="flex-1 flex">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-[210px] bg-white border-r border-[#EBEBEB] z-20 overflow-y-auto">
        <div className="px-6 py-7 border-b border-[#EBEBEB]">
          <Image src="/workiom-logo.png" alt="Workiom" width={100} height={28} className="h-7 w-auto object-contain mb-5" unoptimized />
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
            Visual Identity<br />Guidelines
          </p>
          <p className="text-xs text-slate-300 mt-0.5">Updated May 2026</p>
        </div>

        <nav className="flex-1 py-3">
          {NAV.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={cn(
                'w-full flex items-center gap-3.5 px-6 py-3 text-left transition-all',
                active === s.id
                  ? 'text-slate-900 bg-slate-50 border-r-[3px] border-[#9635F0] font-semibold'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50/70'
              )}
            >
              <span className="text-[10px] font-mono font-bold w-4 flex-shrink-0 text-slate-300">{s.num}</span>
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
                  className="w-full flex items-center gap-3.5 px-6 py-3 text-left text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-[10px] font-mono text-slate-300">{s.num}</span>
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
        <div className="lg:hidden sticky top-16 z-30 flex items-center gap-3 px-5 py-3 bg-white border-b border-[#EBEBEB]">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <Menu className="h-4 w-4" /> Sections
          </button>
          <span className="text-slate-300">·</span>
          <span className="text-xs font-mono text-slate-300">Visual Identity Guidelines</span>
        </div>

        {/* ── 01 Introduction ── */}
        <section id="introduction">
          {/* Hero */}
          <div
            className="relative h-72 sm:h-80 flex flex-col justify-end px-10 sm:px-16 pb-12 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #231F61 0%, #52009F 55%, #9635F0 100%)' }}
          >
            <p className="text-xs font-semibold text-white/40 mb-3">Visual Identity Guidelines</p>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight">
              Workiom<br />Brand
            </h1>
            <p className="text-xs text-white/30 mt-3">Version 1.0  ·  May 2026</p>
            <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-[#FDBC0B]/8 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-20 w-48 h-48 rounded-full bg-[#3C84FD]/10 blur-2xl pointer-events-none" />
          </div>

          {/* Intro paragraph + full brief copy */}
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
              <p className="text-white font-bold text-center text-sm leading-snug">Transforming ideas into workflows</p>
            </div>
            <div className="aspect-square rounded-2xl flex items-center justify-center p-6 bg-[#231F61]">
              <Image src="/workiom-logo.png" alt="Workiom" width={110} height={30} className="w-[80%] h-auto brightness-0 invert" unoptimized />
            </div>
            <div className="aspect-square rounded-2xl flex items-center justify-center bg-[#F4F4F4] overflow-hidden">
              <span className="text-[72px] font-black text-slate-200 leading-none tracking-tighter select-none">Aa</span>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden flex flex-col">
              {['#9635F0', '#3C84FD', '#FDBC0B', '#231F61'].map((c) => (
                <div key={c} className="flex-1" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </section>

        {/* ── 02 Strategy ── */}
        <section id="strategy">
          <SectionBanner num="02" title="Strategy" />

          <div className="group relative px-10 sm:px-16 pt-12 pb-20 space-y-10">
            <div className="absolute top-4 right-8">
              <CopyLLMButton text={LLM.strategy} />
            </div>

            <div className="rounded-2xl px-12 py-14" style={{ background: 'linear-gradient(135deg, #52009F, #9635F0)' }}>
              <p className="text-xs font-semibold text-white/40 mb-4">Brand Essence</p>
              <p className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                Workflows<br />made simple.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: 'Mission', copy: 'To help modern teams build, automate, and scale their operations without complexity.' },
                { label: 'Vision',  copy: 'A future where every team can create the software they need to work better.' },
              ].map((c) => (
                <div key={c.label} className="border border-[#EAEAEA] rounded-2xl p-8 bg-white">
                  <p className="text-xs font-semibold text-slate-400 mb-4">{c.label}</p>
                  <p className="text-lg text-slate-700 leading-relaxed">{c.copy}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 mb-5">Brand Principles</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { word: 'Clear',       desc: 'Simple, direct communication. No jargon, no fluff.' },
                  { word: 'Intelligent', desc: 'Data-informed, purposeful, always precise.' },
                  { word: 'Flexible',    desc: "Adapts to every team's unique way of working." },
                  { word: 'Human',       desc: 'Warm and approachable — never robotic.' },
                ].map((p) => (
                  <div key={p.word} className="border border-[#EAEAEA] rounded-xl p-6">
                    <p className="text-sm font-bold text-[#9635F0] mb-2">{p.word}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 03 Logo ── */}
        <section id="logo" className="border-t border-[#EDEDED]">
          <SectionBanner num="03" title="Logo" />

          <div className="group relative px-10 sm:px-16 pt-12 pb-20 space-y-10">
            <div className="absolute top-4 right-8">
              <CopyLLMButton text={LLM.logo} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl bg-[#F7F7F7] border border-[#EAEAEA] flex items-center justify-center min-h-[180px] p-12">
                <Image src="/workiom-logo.png" alt="Workiom wordmark" width={200} height={52} className="h-12 w-auto object-contain" unoptimized />
              </div>
              <div className="rounded-2xl flex items-center justify-center min-h-[180px] p-12" style={{ background: 'linear-gradient(135deg, #231F61 0%, #52009F 100%)' }}>
                <Image src="/workiom-logo.png" alt="Workiom wordmark inverted" width={200} height={52} className="h-12 w-auto object-contain brightness-0 invert" unoptimized />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 mb-4">Color Usage</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { bg: '#FFFFFF', border: true,  label: 'On White',      invert: false },
                  { bg: '#F4F4F4', border: false, label: 'On Light Gray', invert: false },
                  { bg: '#9635F0', border: false, label: 'On Purple',     invert: true },
                  { bg: '#231F61', border: false, label: 'On Navy',       invert: true },
                ].map((v) => (
                  <div
                    key={v.label}
                    className="rounded-xl flex flex-col items-center justify-center gap-4 py-9 px-5"
                    style={{ backgroundColor: v.bg, border: v.border ? '1px solid #EAEAEA' : undefined }}
                  >
                    <Image src="/workiom-icon.png" alt="Workiom icon" width={40} height={40} className={cn('h-10 w-10 object-contain', v.invert && 'brightness-0 invert')} unoptimized />
                    <p className={cn('text-[10px] font-semibold text-center', v.invert ? 'text-white/40' : 'text-slate-400')}>{v.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-8">
                <p className="text-xs font-bold text-emerald-700 mb-5">Do</p>
                <ul className="space-y-3">
                  {['Use on white or very light backgrounds', 'Maintain clear space around the logo', 'Use SVG format for all digital outputs', 'Use the white version on dark / colored backgrounds', 'Use the icon mark for small app contexts'].map((i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>{i}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-red-100 bg-red-50/60 p-8">
                <p className="text-xs font-bold text-red-600 mb-5">Don't</p>
                <ul className="space-y-3">
                  {['Stretch, skew, or distort the logo', 'Place on busy or low-contrast backgrounds', 'Add shadows, outlines, glows, or effects', 'Use unofficial colors on the mark', 'Recreate the logo in a different typeface'].map((i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>{i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── 04 Typography ── */}
        <section id="typography" className="border-t border-[#EDEDED]">
          <SectionBanner num="04" title="Typography" />

          <div className="group relative px-10 sm:px-16 pt-12 pb-20 space-y-10">
            <div className="absolute top-4 right-8">
              <CopyLLMButton text={LLM.typography} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl bg-[#F7F7F7] border border-[#EAEAEA] p-10 flex flex-col justify-between min-h-[160px]">
                <p className="text-xs font-semibold text-slate-400">Latin / English</p>
                <div>
                  <p className="text-4xl font-bold text-slate-900 tracking-tight mt-4">General Sans</p>
                  <p className="text-sm text-slate-400 mt-1.5">For all Latin and English text</p>
                </div>
              </div>
              <div className="rounded-2xl bg-[#F7F7F7] border border-[#EAEAEA] p-10 flex flex-col justify-between min-h-[160px]" dir="rtl">
                <p className="text-xs font-semibold text-slate-400 text-right">عربي / Arabic</p>
                <div>
                  <p className="text-4xl font-bold text-slate-900 mt-4 text-right">IBM Plex Sans Arabic</p>
                  <p className="text-sm text-slate-400 mt-1.5 text-right">للنصوص العربية في كل مكان</p>
                </div>
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

            <div>
              <p className="text-xs font-semibold text-slate-400 mb-4">Screen Usage Chart</p>
              <div className="border border-[#EAEAEA] rounded-2xl overflow-hidden">
                <div className="grid grid-cols-4 bg-[#F6F6F6] px-7 py-3 border-b border-[#EAEAEA]">
                  {['Size', 'Line Height', 'Kerning', 'Tracking'].map((h) => (
                    <p key={h} className="text-xs font-semibold text-slate-400">{h}</p>
                  ))}
                </div>
                {[
                  ['0–15 px',  '128%', 'Metrics', '−1%'],
                  ['16–25 px', '120%', 'Metrics', '−2%'],
                  ['26–42 px', '104%', 'Metrics', '−2%'],
                  ['42–76 px', '98%',  'Metrics', '−3%'],
                  ['76 px+',   '96%',  'Metrics', '−4%'],
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-4 px-7 py-4 bg-white hover:bg-[#FAFAFA] transition-colors border-b border-[#F0F0F0] last:border-0">
                    {row.map((cell) => <p key={cell} className="text-sm text-slate-700 font-mono">{cell}</p>)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 05 Color ── */}
        <section id="color" className="border-t border-[#EDEDED]">
          <SectionBanner num="05" title="Color" />

          <div className="group relative px-10 sm:px-16 pt-10 pb-20 space-y-4">
            <div className="absolute top-4 right-8">
              <CopyLLMButton text={LLM.colors} />
            </div>

            <p className="text-base text-slate-500 max-w-xl leading-relaxed pb-6">
              Our palette combines vibrant purples and blues with a bold yellow accent, grounded by deep navy and clean neutrals.
            </p>

            <ColorSwatch name="Workiom Purple" hex="#9635F0" rgb="150, 53, 240" tall />

            <div className="grid grid-cols-3 gap-4">
              <ColorSwatch name="Blue"        hex="#3C84FD" rgb="60, 132, 253" />
              <ColorSwatch name="Dark Purple" hex="#52009F" rgb="82, 0, 159" />
              <ColorSwatch name="Violet"      hex="#8201AD" rgb="130, 1, 173" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <ColorSwatch name="Yellow"     hex="#FDBC0B" rgb="253, 188, 11" />
              <ColorSwatch name="Deep Navy"  hex="#231F61" rgb="35, 31, 97" />
              <ColorSwatch name="Light Gray" hex="#D9D9D9" rgb="217, 217, 217" light />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <ColorSwatch name="Black" hex="#000000" rgb="0, 0, 0" />
              <ColorSwatch name="White" hex="#FFFFFF" rgb="255, 255, 255" light />
            </div>
          </div>
        </section>

        {/* ── 06 Resources ── */}
        <section id="resources" className="border-t border-[#EDEDED]">
          <SectionBanner num="06" title="Resources" />

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
                  <p className="text-sm font-bold text-slate-900 mb-2">{r.title}</p>
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
              style={{ background: 'linear-gradient(135deg, #231F61 0%, #52009F 55%, #9635F0 100%)' }}
            >
              <div>
                <p className="text-xl font-bold text-white mb-1">Need help applying the Workiom brand?</p>
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
        <footer className="bg-[#0A0A0A] px-10 sm:px-16 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-white/10">
            <div>
              <p className="text-xs font-semibold text-white/60 mb-1">Visual Identity Guidelines</p>
              <p className="text-[10px] text-white/25 tracking-wider">Version 1.0</p>
            </div>
            <p className="text-xs text-white/25">brand@workiom.com</p>
          </div>
          <div className="flex items-center justify-between pt-8">
            <div className="flex items-center gap-3">
              <Image src="/workiom-icon.png" alt="Workiom" width={20} height={20} className="h-5 w-5 object-contain opacity-40" unoptimized />
              <span className="text-[11px] text-white/25">© 2026 Workiom. All rights reserved.</span>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
