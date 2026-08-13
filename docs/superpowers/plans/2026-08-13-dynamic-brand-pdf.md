# Dynamic Brand Guidelines PDF Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static `public/workiom-brand-guidelines.pdf` download with a PDF generated on demand from a new 16:9 slide deck, rendered from live brand data, so the file always matches the code.

**Architecture:** A new unlisted Next.js page (`/brand-guidelines/print`) renders 8 fixed 1600×900 `<section>` "slides" using the site's existing fonts/Tailwind setup. A Node-runtime API route (`/api/brand-guidelines/pdf`) launches headless Chromium (via Puppeteer), navigates to that page, and calls `page.pdf()` to produce a paginated PDF, which it streams back as the download. Colors/logo path used by both the live `/brand-guidelines` page and the new slides live in one shared module (`lib/brand.ts`).

**Tech Stack:** Next.js 16 (App Router, Node runtime route), Tailwind CSS v4, `puppeteer-core` + `@sparticuz/chromium` in production, `puppeteer` (full) for local dev.

**No test framework exists in this repo** (no jest/vitest, no `test` script in `package.json`). This plan verifies each step manually (dev server + browser, or `curl`) and with TypeScript's own checker (`pnpm exec tsc --noEmit`), consistent with how the rest of the codebase is verified.

---

### Task 1: Shared brand data module

**Files:**
- Create: `lib/brand.ts`
- Modify: `app/brand-guidelines/page.tsx` (one line, in the Color section)

- [ ] **Step 1: Create the shared data module**

```ts
// lib/brand.ts
export const BRAND_GRADIENT =
  'linear-gradient(135deg, #231F61 0%, #360C73 55%, #9635F0 100%)';

export type BrandColor = {
  name: string;
  hex: string;
  rgb: string;
};

export const COLOR_PURPLE: BrandColor = {
  name: 'Workiom Purple',
  hex: '#9635F0',
  rgb: '150, 53, 240',
};

export const COLOR_NAVY: BrandColor = {
  name: 'Deep Navy',
  hex: '#231F61',
  rgb: '35, 31, 97',
};

export const LOGO_SRC = '/workiom-logo.png';
```

- [ ] **Step 2: Wire the live page's Purple swatch to the shared constant**

In `app/brand-guidelines/page.tsx`, add the import near the top (alongside the other `@/lib/...` import):

```tsx
import { COLOR_PURPLE } from '@/lib/brand';
```

Find this line (in the `activePage === 'color'` section):

```tsx
<ColorSwatch name="Workiom Purple" hex="#9635F0" rgb="150, 53, 240" tall />
```

Replace it with:

```tsx
<ColorSwatch name={COLOR_PURPLE.name} hex={COLOR_PURPLE.hex} rgb={COLOR_PURPLE.rgb} tall />
```

This is the one color the live page and the new PDF deck both need — it's the only swatch worth wiring to the shared module. Leave the rest of the Color section's swatches as literal values; there's no second consumer for them yet, and rewiring the whole section isn't needed for this feature (YAGNI).

- [ ] **Step 3: Verify**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Visually: open `/brand-guidelines`, go to the Color section (04), confirm the large "Workiom Purple" swatch still reads `#9635F0` / `150, 53, 240` exactly as before.

- [ ] **Step 4: Commit**

```bash
git add lib/brand.ts app/brand-guidelines/page.tsx
git commit -m "feat: add shared brand data module for PDF/page reuse"
```

---

### Task 2: Install PDF-generation dependencies

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml` (via `pnpm add`)
- Modify: `next.config.ts`

- [ ] **Step 1: Install runtime and dev dependencies**

```bash
pnpm add puppeteer-core @sparticuz/chromium
pnpm add -D puppeteer
```

`puppeteer-core` + `@sparticuz/chromium` render the PDF in production (Vercel's Linux Node runtime). `puppeteer` (full package, bundles a matching local Chromium) is dev-only — it's what runs when you test on your own machine, since `@sparticuz/chromium`'s binary is Linux-only and won't launch on Windows/macOS dev machines.

- [ ] **Step 2: Mark the Chromium packages as server-external**

In `next.config.ts`, add `serverExternalPackages` to the config object:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  async redirects() {
    return [
      {
        source: '/browse',
        destination: '/',
        permanent: false,
      },
    ];
  },
  images: {
    // Asset files go through /api/file/[...path] (same-origin proxy — no entry needed).
    // The wildcard pattern covers user-supplied cover image URLs in collections.
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
};

export default nextConfig;
```

This tells Next.js's bundler not to try to parse/bundle these packages — they contain native binaries and dynamic `require()`s that break bundling otherwise.

- [ ] **Step 3: Verify**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `node -e "console.log(require('./package.json').dependencies['puppeteer-core'], require('./package.json').dependencies['@sparticuz/chromium'], require('./package.json').devDependencies['puppeteer'])"`
Expected: three version strings printed, none `undefined`.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml next.config.ts
git commit -m "chore: add puppeteer/chromium dependencies for PDF generation"
```

---

### Task 3: Chromium launcher

**Files:**
- Create: `lib/pdf/getBrowser.ts`

- [ ] **Step 1: Write the launcher**

```ts
// lib/pdf/getBrowser.ts
import type { Browser } from 'puppeteer-core';

export async function getBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    const chromium = (await import('@sparticuz/chromium')).default;
    const { launch } = await import('puppeteer-core');
    return launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const { launch } = await import('puppeteer');
  // puppeteer's Browser type is structurally identical to puppeteer-core's —
  // it's built on top of puppeteer-core — but the packages ship separate
  // type declarations, so callers on this branch need an explicit cast.
  return launch({ headless: true }) as unknown as Promise<Browser>;
}
```

- [ ] **Step 2: Verify**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/pdf/getBrowser.ts
git commit -m "feat: add environment-aware Chromium launcher for PDF route"
```

---

### Task 4: Hide the navbar on `/print`, add shared slide primitives

**Files:**
- Modify: `components/navbar.tsx:97,107`
- Create: `app/brand-guidelines/print/slides/shared.tsx`

- [ ] **Step 1: Extend the navbar's hidden-route check**

In `components/navbar.tsx`, find:

```tsx
  useEffect(() => {
    if (pathname === '/brand-guidelines') return;
```

Replace with:

```tsx
  useEffect(() => {
    if (pathname === '/brand-guidelines' || pathname === '/brand-guidelines/print') return;
```

Then find:

```tsx
  if (pathname === '/brand-guidelines') return null;
```

Replace with:

```tsx
  if (pathname === '/brand-guidelines' || pathname === '/brand-guidelines/print') return null;
```

The live `/brand-guidelines` page already hides the global navbar this way (it has its own sidebar). The new `/print` route needs the same treatment — it's a bare slide deck with no chrome at all.

- [ ] **Step 2: Write the shared slide primitives**

```tsx
// app/brand-guidelines/print/slides/shared.tsx
import type { ReactNode } from 'react';

export function Slide({
  children,
  background = '#FFFFFF',
  dark = false,
  className = '',
}: {
  children: ReactNode;
  background?: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`relative w-[1600px] h-[900px] shrink-0 overflow-hidden break-after-page flex flex-col px-20 py-14 ${
        dark ? 'text-white' : 'text-slate-900'
      } ${className}`}
      style={{ background }}
    >
      {children}
    </section>
  );
}

export function SlideHeader({
  section,
  page,
  dark = false,
}: {
  section: string;
  page: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between text-sm tracking-wide pb-5 mb-10 border-b ${
        dark ? 'border-white/15 text-white/50' : 'border-[#EDEDED] text-slate-400'
      }`}
    >
      <span className="flex items-center gap-2.5 font-medium">
        <span className={`h-3 w-3 rounded-full ${dark ? 'bg-white' : 'bg-[#9635F0]'}`} />
        Brand Guidelines
      </span>
      <span className="font-medium">{section}</span>
      <span className="font-mono">{page}</span>
    </div>
  );
}
```

`Slide` fixes every slide at exactly 1600×900 (16:9) and uses Tailwind's `break-after-page` utility so each one lands on its own PDF page once Puppeteer prints the deck. `SlideHeader` is the thin breadcrumb/page-number row reused by every content slide (the cover and closing slides build their own header inline since they don't have the hairline rule).

- [ ] **Step 3: Verify**

Run: `pnpm exec tsc --noEmit`
Expected: no errors (note: `shared.tsx` isn't imported by anything yet, so this just confirms it's syntactically/typewise valid).

- [ ] **Step 4: Commit**

```bash
git add components/navbar.tsx app/brand-guidelines/print/slides/shared.tsx
git commit -m "feat: hide navbar on /brand-guidelines/print, add slide primitives"
```

---

### Task 5: Cover and Primary Logo slides

**Files:**
- Create: `app/brand-guidelines/print/slides/Cover.tsx`
- Create: `app/brand-guidelines/print/slides/PrimaryLogo.tsx`

- [ ] **Step 1: Write the Cover slide**

```tsx
// app/brand-guidelines/print/slides/Cover.tsx
import { Slide } from './shared';
import { BRAND_GRADIENT } from '@/lib/brand';

export function CoverSlide() {
  return (
    <Slide dark background={BRAND_GRADIENT} className="justify-between">
      <div className="flex items-center justify-between text-sm tracking-wide text-white/50">
        <span className="flex items-center gap-2.5 font-medium">
          <span className="h-3 w-3 rounded-full bg-white" />
          Workiom
        </span>
        <span className="font-medium">Volume 1.0</span>
        <span className="font-mono">01</span>
      </div>
      <div>
        <h1 className="text-[110px] font-bold leading-[0.95] text-white">Brand</h1>
        <h1 className="text-[110px] font-bold leading-[0.95] text-white/40">Guidelines</h1>
      </div>
      <p className="text-sm text-white/40">May 2026</p>
    </Slide>
  );
}
```

- [ ] **Step 2: Write the Primary Logo slide**

```tsx
// app/brand-guidelines/print/slides/PrimaryLogo.tsx
import { Slide, SlideHeader } from './shared';
import { LOGO_SRC } from '@/lib/brand';

export function PrimaryLogoSlide() {
  return (
    <Slide>
      <SlideHeader section="Primary Logo" page="02" />
      <h2 className="text-5xl font-semibold mb-2">Primary Logo</h2>
      <div className="flex-1 flex items-center gap-16 mt-4">
        <p className="w-1/3 text-base text-slate-500 leading-relaxed">
          The primary lockup is the official logo and should be used in most brand
          applications. It combines the mark and the wordmark in a fixed relationship.
        </p>
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="Workiom" className="h-24 w-auto object-contain" />
          <div className="flex gap-24 text-xs text-slate-300 border-t border-[#EDEDED] pt-4 w-2/3 justify-center">
            <span>Logomark</span>
            <span>Logotype</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
```

- [ ] **Step 3: Verify**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/brand-guidelines/print/slides/Cover.tsx app/brand-guidelines/print/slides/PrimaryLogo.tsx
git commit -m "feat: add Cover and Primary Logo PDF slides"
```

---

### Task 6: Logo Construction, Logo Scaling, Logo Backgrounds slides

**Files:**
- Create: `app/brand-guidelines/print/slides/LogoConstruction.tsx`
- Create: `app/brand-guidelines/print/slides/LogoScaling.tsx`
- Create: `app/brand-guidelines/print/slides/LogoBackgrounds.tsx`

- [ ] **Step 1: Write the Logo Construction slide (placeholder)**

```tsx
// app/brand-guidelines/print/slides/LogoConstruction.tsx
import { Slide, SlideHeader } from './shared';

export function LogoConstructionSlide() {
  return (
    <Slide>
      <SlideHeader section="Logo Construction" page="03" />
      <h2 className="text-5xl font-semibold mb-2">Logo Construction</h2>
      <div className="flex-1 flex items-center gap-16 mt-4">
        <p className="w-1/3 text-base text-slate-500 leading-relaxed">
          The logo is built on a fixed grid that governs proportion, spacing, and
          alignment between the mark and wordmark.
        </p>
        <div
          className="flex-1 h-full rounded-2xl flex items-center justify-center"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(150,53,240,0.08) 0px, rgba(150,53,240,0.08) 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, rgba(150,53,240,0.08) 0px, rgba(150,53,240,0.08) 1px, transparent 1px, transparent 32px)',
          }}
        >
          <div className="border-2 border-dashed border-[#9635F0] rounded-xl px-12 py-8 flex flex-col items-center gap-2 bg-white/70">
            <span className="text-sm font-bold text-[#9635F0] tracking-wide">
              SVG PLACEHOLDER
            </span>
            <span className="text-xs text-[#b48ee0]">
              Construction grid — swap in the real file later
            </span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
```

This is intentionally a placeholder per the design spec's open item — when the real construction SVG is provided later, it replaces the dashed-box `<div>` in this file; the `Slide`/`SlideHeader`/paragraph structure around it stays the same.

- [ ] **Step 2: Write the Logo Scaling slide**

```tsx
// app/brand-guidelines/print/slides/LogoScaling.tsx
import { Slide, SlideHeader } from './shared';
import { LOGO_SRC } from '@/lib/brand';

const SIZES = [32, 64, 96, 160] as const;

export function LogoScalingSlide() {
  return (
    <Slide>
      <SlideHeader section="Logo Scaling" page="04" />
      <h2 className="text-5xl font-semibold mb-2">Logo Scaling</h2>
      <div className="flex-1 flex items-center gap-16 mt-4">
        <p className="w-1/4 text-base text-slate-500 leading-relaxed">
          Logo should scale proportionally and remain legible across all media.
          Minimum digital height is 32px.
        </p>
        <div className="flex-1 flex flex-col gap-6 justify-center">
          {SIZES.map((size) => (
            <div key={size} className="flex items-center gap-6">
              <span className="w-20 text-sm text-slate-300 font-mono">{size} px</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_SRC}
                alt="Workiom"
                style={{ height: size }}
                className="w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}
```

- [ ] **Step 3: Write the Logo Backgrounds slide**

```tsx
// app/brand-guidelines/print/slides/LogoBackgrounds.tsx
import { Slide, SlideHeader } from './shared';
import { LOGO_SRC } from '@/lib/brand';

const BACKGROUNDS = [
  { label: 'On White', bg: '#FFFFFF', border: true, invert: false },
  { label: 'On Light Gray', bg: '#F4F4F4', border: false, invert: false },
  { label: 'On Navy', bg: '#231F61', border: false, invert: true },
  { label: 'On Purple', bg: '#9635F0', border: false, invert: true },
] as const;

export function LogoBackgroundsSlide() {
  return (
    <Slide>
      <SlideHeader section="Logo Backgrounds" page="05" />
      <h2 className="text-5xl font-semibold mb-2">Logo Backgrounds</h2>
      <div className="flex-1 flex items-center gap-16 mt-4">
        <p className="w-1/4 text-base text-slate-500 leading-relaxed">
          The logo is designed for flexibility. Only approved color combinations
          should be used.
        </p>
        <div className="flex-1 h-full grid grid-cols-2 grid-rows-2 gap-4">
          {BACKGROUNDS.map((b) => (
            <div
              key={b.label}
              className="rounded-xl flex items-center justify-center"
              style={{ backgroundColor: b.bg, border: b.border ? '1px solid #EAEAEA' : undefined }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_SRC}
                alt={b.label}
                className={`h-12 w-auto object-contain ${b.invert ? 'brightness-0 invert' : ''}`}
              />
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}
```

- [ ] **Step 4: Verify**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/brand-guidelines/print/slides/LogoConstruction.tsx app/brand-guidelines/print/slides/LogoScaling.tsx app/brand-guidelines/print/slides/LogoBackgrounds.tsx
git commit -m "feat: add Logo Construction, Scaling, and Backgrounds PDF slides"
```

---

### Task 7: Typography and Primary Color slides

**Files:**
- Create: `app/brand-guidelines/print/slides/Typography.tsx`
- Create: `app/brand-guidelines/print/slides/PrimaryColor.tsx`

- [ ] **Step 1: Write the Typography slide**

```tsx
// app/brand-guidelines/print/slides/Typography.tsx
import { Slide, SlideHeader } from './shared';

const SPECS = [
  { weight: 'Bold', size: '32', tracking: '-2%', lineHeight: '104%' },
  { weight: 'SemiBold', size: '24', tracking: '-1%', lineHeight: '112%' },
  { weight: 'Regular', size: '16', tracking: '0%', lineHeight: '150%' },
] as const;

export function TypographySlide() {
  return (
    <Slide>
      <SlideHeader section="Typography" page="06" />
      <h2 className="text-5xl font-semibold mb-2">Typography</h2>
      <div className="flex-1 flex items-center gap-16 mt-4">
        <div className="w-2/5">
          <p
            className="text-[64px] font-bold leading-none text-slate-900"
            style={{ fontFamily: "'General Sans', sans-serif" }}
          >
            General
            <br />
            Sans
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-3 text-sm">
          <div className="grid grid-cols-4 gap-4 text-slate-400 border-b border-[#EDEDED] pb-2">
            <span>Weight</span>
            <span>Size</span>
            <span>Tracking</span>
            <span>Line-height</span>
          </div>
          {SPECS.map((s) => (
            <div key={s.weight} className="grid grid-cols-4 gap-4 text-slate-600">
              <span>{s.weight}</span>
              <span>{s.size}</span>
              <span>{s.tracking}</span>
              <span>{s.lineHeight}</span>
            </div>
          ))}
          <p className="mt-4 text-base italic text-slate-400">
            &quot;Transforming ideas into workflows&quot;
          </p>
        </div>
      </div>
    </Slide>
  );
}
```

- [ ] **Step 2: Write the Primary Color slide**

```tsx
// app/brand-guidelines/print/slides/PrimaryColor.tsx
import { Slide, SlideHeader } from './shared';
import { COLOR_PURPLE, COLOR_NAVY, type BrandColor } from '@/lib/brand';

function tints(hex: string): string[] {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return [0.35, 0.6, 0.85].map((t) => {
    const mix = (c: number) => Math.round(c + (255 - c) * t);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  });
}

const COLORS: BrandColor[] = [COLOR_PURPLE, COLOR_NAVY];

export function PrimaryColorSlide() {
  return (
    <Slide>
      <SlideHeader section="Color" page="07" />
      <h2 className="text-5xl font-semibold mb-2">Primary Color</h2>
      <div className="flex-1 flex items-center gap-10 mt-4">
        <p className="w-1/5 text-base text-slate-500 leading-relaxed">
          Our primary palette defines Workiom&apos;s core identity across digital,
          print, and product.
        </p>
        {COLORS.map((c) => (
          <div key={c.hex} className="flex-1 h-full flex flex-col">
            <div className="flex-1 relative rounded-t-xl" style={{ backgroundColor: c.hex }}>
              <span className="absolute bottom-4 left-5 text-xs text-white/80">HEX</span>
              <span className="absolute bottom-4 right-5 text-xs text-white/80 font-mono">
                {c.hex.replace('#', '')}
              </span>
            </div>
            <div className="flex h-10 rounded-b-xl overflow-hidden">
              {tints(c.hex).map((t) => (
                <div key={t} className="flex-1" style={{ backgroundColor: t }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Slide>
  );
}
```

- [ ] **Step 3: Verify**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/brand-guidelines/print/slides/Typography.tsx app/brand-guidelines/print/slides/PrimaryColor.tsx
git commit -m "feat: add Typography and Primary Color PDF slides"
```

---

### Task 8: Closing slide and the print deck page

**Files:**
- Create: `app/brand-guidelines/print/slides/Closing.tsx`
- Create: `app/brand-guidelines/print/page.tsx`

- [ ] **Step 1: Write the Closing slide**

```tsx
// app/brand-guidelines/print/slides/Closing.tsx
import { Slide } from './shared';
import { BRAND_GRADIENT } from '@/lib/brand';

export function ClosingSlide() {
  return (
    <Slide dark background={BRAND_GRADIENT} className="justify-center items-center text-center">
      <p className="text-4xl font-semibold text-white mb-4">
        Need help applying the Workiom brand?
      </p>
      <p className="text-lg text-white/60">
        Contact the brand team for guidance, approvals, or custom assets.
      </p>
      <p className="text-lg text-white mt-8 font-medium">brand@workiom.com</p>
    </Slide>
  );
}
```

- [ ] **Step 2: Assemble the print deck page**

```tsx
// app/brand-guidelines/print/page.tsx
import { CoverSlide } from './slides/Cover';
import { PrimaryLogoSlide } from './slides/PrimaryLogo';
import { LogoConstructionSlide } from './slides/LogoConstruction';
import { LogoScalingSlide } from './slides/LogoScaling';
import { LogoBackgroundsSlide } from './slides/LogoBackgrounds';
import { TypographySlide } from './slides/Typography';
import { PrimaryColorSlide } from './slides/PrimaryColor';
import { ClosingSlide } from './slides/Closing';

export default function BrandGuidelinesPrintPage() {
  return (
    <>
      <CoverSlide />
      <PrimaryLogoSlide />
      <LogoConstructionSlide />
      <LogoScalingSlide />
      <LogoBackgroundsSlide />
      <TypographySlide />
      <PrimaryColorSlide />
      <ClosingSlide />
    </>
  );
}
```

- [ ] **Step 3: Verify — this is the first checkpoint where the whole deck is visible**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Start the dev server (`pnpm dev`) if it isn't already running, then open `http://localhost:3000/brand-guidelines/print` in a browser.
Expected: no navbar, no sidebar — just 8 full-bleed 1600×900 sections stacked vertically, in order: dark Cover, Primary Logo, Logo Construction (grid + placeholder box), Logo Scaling, Logo Backgrounds (2×2 grid), Typography, Primary Color (two swatches + tint strips), dark Closing card. Check each slide's text isn't clipped or overflowing its 1600×900 box.

- [ ] **Step 4: Commit**

```bash
git add app/brand-guidelines/print/slides/Closing.tsx app/brand-guidelines/print/page.tsx
git commit -m "feat: add Closing slide and assemble the print deck page"
```

---

### Task 9: PDF API route

**Files:**
- Create: `app/api/brand-guidelines/pdf/route.ts`

- [ ] **Step 1: Write the route**

```ts
// app/api/brand-guidelines/pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBrowser } from '@/lib/pdf/getBrowser';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });
    await page.goto(`${req.nextUrl.origin}/brand-guidelines/print`, {
      waitUntil: 'networkidle0',
    });
    await page.evaluateHandle('document.fonts.ready');

    const pdf = await page.pdf({
      width: '1600px',
      height: '900px',
      printBackground: true,
    });

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="workiom-brand-guidelines.pdf"',
      },
    });
  } finally {
    await browser.close();
  }
}
```

`waitUntil: 'networkidle0'` waits for the Fontshare CDN request (General Sans) to finish; `document.fonts.ready` then waits for the fonts to actually finish rasterizing before the page is printed — without it, the PDF can occasionally capture a fallback-font flash.

- [ ] **Step 2: Verify**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

With the dev server running (`pnpm dev`), run:

```bash
curl -s -o test-output.pdf -D - http://localhost:3000/api/brand-guidelines/pdf
```

Expected: response headers include `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="workiom-brand-guidelines.pdf"`; `test-output.pdf` is written and is several hundred KB (not 0 bytes). Open `test-output.pdf` and confirm it has 8 pages matching the slides checked in Task 8, then delete it (`rm test-output.pdf`) — it's a manual scratch file, not something to commit.

- [ ] **Step 3: Commit**

```bash
git add app/api/brand-guidelines/pdf/route.ts
git commit -m "feat: add PDF generation API route"
```

---

### Task 10: Wire the download link to the new route, retire the static file

**Files:**
- Modify: `app/brand-guidelines/page.tsx:709-711` (the header's Download PDF link)
- Delete: `public/workiom-brand-guidelines.pdf`

- [ ] **Step 1: Point the download link at the new route**

In `app/brand-guidelines/page.tsx`, find:

```tsx
                <a
                  href="/workiom-brand-guidelines.pdf"
                  download
                  className="flex items-center gap-1 text-white/60 hover:text-white transition-colors font-medium"
                >
```

Replace the `href` with:

```tsx
                <a
                  href="/api/brand-guidelines/pdf"
                  download
                  className="flex items-center gap-1 text-white/60 hover:text-white transition-colors font-medium"
                >
```

- [ ] **Step 2: Remove the static PDF**

```bash
git rm public/workiom-brand-guidelines.pdf
```

- [ ] **Step 3: Verify end-to-end**

With the dev server running, open `http://localhost:3000/brand-guidelines` in a browser, click "Download PDF" in the hero header, and confirm the downloaded file is the freshly generated 8-page deck (not the old static file) — check its file size differs from what the static file was, or just open it and confirm it shows the new slide designs, not the old reference PDF's content.

- [ ] **Step 4: Commit**

```bash
git add app/brand-guidelines/page.tsx
git commit -m "feat: serve the dynamic PDF from the header download link"
```

---

## Self-review notes

- **Spec coverage:** all 8 slides from the spec are implemented (Task 5–8); shared brand data (Task 1); headless-render architecture (Tasks 2–3, 9); download link rewire + static file removal (Task 10). The spec's open item (Logo Construction placeholder) is called out explicitly in Task 6, Step 1.
- **Type consistency:** `BrandColor` type defined once in `lib/brand.ts` (Task 1) and reused as-is in `PrimaryColor.tsx` (Task 7) — no redefinition. `getBrowser()`'s return type (`Promise<Browser>` from `puppeteer-core`) is what `route.ts` consumes via `browser.newPage()` / `browser.close()` (Task 9) — no mismatch.
- **No placeholders** other than the intentional, spec-called-out Logo Construction visual (which is real, working code — just not the final artwork).
