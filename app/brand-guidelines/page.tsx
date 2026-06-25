import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Brand Guidelines — Workiom Assets Library',
  description: 'Official Workiom brand guidelines: colors, typography, logo usage, and visual standards.',
};

const colors = [
  { name: 'Primary Blue', hex: '#4E86F7', rgb: '78, 134, 247', usage: 'CTAs, links, interactive elements' },
  { name: 'Dark Blue', hex: '#3a72e3', rgb: '58, 114, 227', usage: 'Hover states, pressed actions' },
  { name: 'Slate 900', hex: '#0f172a', rgb: '15, 23, 42', usage: 'Primary text, headings' },
  { name: 'Slate 500', hex: '#64748b', rgb: '100, 116, 139', usage: 'Body text, secondary labels' },
  { name: 'Slate 200', hex: '#e2e8f0', rgb: '226, 232, 240', usage: 'Borders, dividers' },
  { name: 'White', hex: '#ffffff', rgb: '255, 255, 255', usage: 'Backgrounds, cards', border: true },
];

const doItems = [
  'Use the logo on white or very light backgrounds',
  'Maintain clear space of at least 16px around the logo',
  'Use the primary blue for call-to-action elements',
  'Use SVG format for digital outputs wherever possible',
  'Keep typography consistent — Inter for all UI text',
];

const dontItems = [
  'Don\'t stretch, skew, or distort the logo',
  'Don\'t place the logo on busy or dark backgrounds',
  'Don\'t use unofficial colors or gradients',
  'Don\'t recreate the logo in a different typeface',
  'Don\'t add shadows or effects to the logo',
];

const typeScale = [
  { label: 'Display', size: '3rem / 48px', weight: '700', sample: 'Brand Assets Library' },
  { label: 'Heading 1', size: '1.875rem / 30px', weight: '700', sample: 'Browse by Category' },
  { label: 'Heading 2', size: '1.25rem / 20px', weight: '600', sample: 'Recently Added' },
  { label: 'Body', size: '1rem / 16px', weight: '400', sample: 'Your centralized hub for logos and brand resources.' },
  { label: 'Small', size: '0.875rem / 14px', weight: '400', sample: 'Filter by category or file type' },
  { label: 'Label', size: '0.75rem / 12px', weight: '500', sample: 'SVG · PNG · JPG' },
];

export default function BrandGuidelinesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50 border-b border-slate-100 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-4">
              Brand Guidelines
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              How to represent Workiom
            </h1>
            <p className="text-lg text-slate-500 mb-8 max-w-xl">
              Follow these guidelines to keep Workiom's visual identity consistent across all touchpoints — digital, print, and beyond.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/browse">
                <Button className="h-10 bg-[#4E86F7] hover:bg-[#3a72e3] text-white gap-2">
                  Browse Assets
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/browse?category=Logos">
                <Button variant="outline" className="h-10 gap-2 text-slate-600 border-slate-200">
                  <Download className="h-4 w-4" />
                  Download Logos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-20 w-full">

        {/* Logo */}
        <section>
          <SectionHeader index="01" title="Logo" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <LogoVariant
              bg="bg-white border border-slate-200"
              label="Primary — Light Background"
              logoSrc="/workiom-logo.png"
            />
            <LogoVariant
              bg="bg-slate-900"
              label="Reversed — Dark Background"
              logoSrc="/workiom-logo.png"
              invert
            />
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <RuleList title="Do" items={doItems} type="do" />
            <RuleList title="Don't" items={dontItems} type="dont" />
          </div>
        </section>

        {/* Colors */}
        <section>
          <SectionHeader index="02" title="Color Palette" />
          <p className="text-slate-500 mt-2 mb-6 max-w-2xl">
            These are the core colors that define Workiom's visual identity. Use them consistently across all materials.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {colors.map((c) => (
              <div key={c.hex} className="flex flex-col gap-2">
                <div
                  className={`h-24 rounded-xl ${c.border ? 'border border-slate-200' : ''} shadow-sm`}
                  style={{ backgroundColor: c.hex }}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                  <p className="text-xs font-mono text-slate-500">{c.hex}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-tight">{c.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <SectionHeader index="03" title="Typography" />
          <p className="text-slate-500 mt-2 mb-6 max-w-2xl">
            Workiom uses <strong className="text-slate-700">Inter</strong> across all digital surfaces — a highly legible sans-serif optimized for screens.
          </p>
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {typeScale.map((t) => (
              <div key={t.label} className="flex items-center gap-6 px-6 py-4 bg-white hover:bg-slate-50 transition-colors">
                <div className="w-24 flex-shrink-0">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{t.size}</p>
                </div>
                <div className="h-px w-px bg-slate-200 self-stretch" />
                <p
                  className="text-slate-900 truncate"
                  style={{ fontSize: t.size.split('/')[0].trim(), fontWeight: t.weight }}
                >
                  {t.sample}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Voice & Tone */}
        <section>
          <SectionHeader index="04" title="Voice &amp; Tone" />
          <p className="text-slate-500 mt-2 mb-6 max-w-2xl">
            How we communicate is as important as how we look. Workiom's voice is confident, helpful, and clear.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { word: 'Clear', desc: 'Get to the point. Avoid jargon. Write for the reader.' },
              { word: 'Confident', desc: 'Own our space. Lead with benefits, not features.' },
              { word: 'Friendly', desc: 'Human and warm — never corporate or robotic.' },
              { word: 'Helpful', desc: 'Every word should help users accomplish something.' },
            ].map((v) => (
              <div key={v.word} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-shadow">
                <p className="text-base font-bold text-[#4E86F7] mb-2">{v.word}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Download CTA */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-10 flex flex-col sm:flex-row items-center justify-between gap-6 border border-blue-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Ready to use the assets?</h2>
            <p className="text-slate-500 text-sm">All logos, icons, and brand files are available in the assets library in SVG, PNG, and JPG formats.</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/browse">
              <Button className="bg-[#4E86F7] hover:bg-[#3a72e3] text-white gap-2">
                Open Library
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono font-bold text-slate-300">{index}</span>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    </div>
  );
}

function LogoVariant({
  bg,
  label,
  logoSrc,
  invert,
}: {
  bg: string;
  label: string;
  logoSrc: string;
  invert?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-10 flex flex-col items-center justify-center gap-4 ${bg}`}>
      <Image
        src={logoSrc}
        alt="Workiom logo"
        width={180}
        height={48}
        className={`h-12 w-auto object-contain ${invert ? 'brightness-0 invert' : ''}`}
        unoptimized
      />
      <p className={`text-xs font-medium ${invert ? 'text-slate-400' : 'text-slate-400'}`}>{label}</p>
    </div>
  );
}

function RuleList({
  title,
  items,
  type,
}: {
  title: string;
  items: string[];
  type: 'do' | 'dont';
}) {
  const isdo = type === 'do';
  return (
    <div className={`rounded-2xl border p-6 ${isdo ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50'}`}>
      <p className={`text-sm font-bold mb-4 ${isdo ? 'text-emerald-700' : 'text-red-600'}`}>{title}</p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
            <span className={`mt-0.5 flex-shrink-0 text-base leading-none ${isdo ? 'text-emerald-500' : 'text-red-400'}`}>
              {isdo ? '✓' : '✕'}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
