# Dynamic Brand Guidelines PDF — Design

## Goal

Replace the current static PDF download (a copy of `references/Brand guideline.pdf`) with a PDF generated on demand from the live `/brand-guidelines` page's own data — same colors, logo, and copy the page renders with, in a new 16:9 editorial slide layout (inspired by the provided "axera" reference), restyled in Workiom's palette and fonts. Regenerating the PDF should require no manual design work: change a color or the logo in code, and the next download reflects it.

## Non-goals (this iteration)

- Does not include the "Brand in Use" section (admin-uploaded images, variable count/aspect ratio) or "Marketing Video" — neither fits a fixed print-style deck cleanly.
- Not a redesign of the live scrolling page — only a new, separate print-oriented template feeding the PDF.

## Architecture

**Approach: headless-browser render.** A dedicated Next.js page renders the deck as HTML/CSS (reusing the site's existing fonts — General Sans via the Fontshare `@import` already in `globals.css`, IBM Plex Sans Arabic via `next/font/google` — and Tailwind), sized as a sequence of 1600×900 (16:9) sections. An API route drives headless Chromium to load that page and print it to a paginated PDF, streamed back as the download.

```
GET /api/brand-guidelines/pdf
  → launches headless Chromium
  → navigates to /brand-guidelines/print (internal, unlisted route)
  → page.pdf({ width: '1600px', height: '900px', printBackground: true })
  → streams PDF with Content-Disposition: attachment
```

The existing header "Download PDF" link (`app/brand-guidelines/page.tsx`) changes its `href` from the static `/workiom-brand-guidelines.pdf` file to `/api/brand-guidelines/pdf`.

**Chromium runtime:** `puppeteer-core` + `@sparticuz/chromium` in production (Vercel Node runtime, Linux binary). Local dev on Windows can't run that binary, so the launcher branches: full `puppeteer` (bundles a matching local Chromium) when not running on Vercel, `puppeteer-core` + `@sparticuz/chromium` when `process.env.VERCEL` is set. Isolated in `lib/pdf/getBrowser.ts` so the route code doesn't care which path ran.

**Shared brand data:** Colors and logo references used by both the live page and the new print template move into `lib/brand.ts` (hex values, RGB strings, names — the same values currently inlined in `app/brand-guidelines/page.tsx`'s `ColorSwatch` calls and `LLM.colors`). Both the live page and the PDF template import from there, so this is the concrete sense in which the PDF is "dynamic based on the page and data" rather than a hand-made copy.

## Slide deck (16:9, in order)

1. **Cover** — dark gradient (`#231F61 → #360C73 → #9635F0`), two-line title "Brand" / "Guidelines" (second line dimmed), thin header row with a small brand mark, "VOLUME 1.0", page number.
2. **Primary Logo** — logomark + wordmark centered, labeled "Logomark" / "Logotype" underneath, short usage paragraph on the left.
3. **Logo Construction** — placeholder for now: grid-paper background + dashed-border "SVG placeholder" box in the content area. Swapped for the real construction SVG once provided (drops into the same slot — no layout change expected).
4. **Logo Scaling** — logo shown at increasing sizes (32 / 64 / 96 / 160 px) with size labels, mirroring the live Logo page's proportions guidance.
5. **Logo Backgrounds** — 2×2 grid: on white / light gray / navy / purple, reusing the same combinations already shown on the live Logo page's "Color usage" grid.
6. **Typography** — "General Sans" large specimen on the left, a small weight/size/tracking/line-height spec table on the right.
7. **Primary Color** — two large swatches (Purple `#9635F0`, Navy `#231F61`) each with a 3-step tint strip and HEX label, pulled from `lib/brand.ts`.
8. **Closing** — dark-gradient contact card mirroring the cover's style: "Need help applying the brand?" + `brand@workiom.com`, reusing the Resources page's existing CTA copy.

Every slide reuses the same thin header pattern established in the approved mockups: small brand-mark dot · breadcrumb ("Brand Guidelines") · section name · page number, with a hairline rule beneath it on light slides.

## Implementation pieces

- `lib/brand.ts` — shared color/logo constants (extracted from `app/brand-guidelines/page.tsx`).
- `lib/pdf/getBrowser.ts` — environment-aware Chromium launcher.
- `app/brand-guidelines/print/page.tsx` — the 8-slide deck, server-rendered, `?` no auth required (unlisted, not in nav).
- `app/brand-guidelines/print/slides/*.tsx` — one component per slide for readability.
- `app/api/brand-guidelines/pdf/route.ts` — Node runtime route: launch browser → navigate → `page.pdf()` → stream response.
- `app/brand-guidelines/page.tsx` — change the header download link's `href` to `/api/brand-guidelines/pdf`.
- Remove `public/workiom-brand-guidelines.pdf` (the static copy) once the dynamic route replaces it.

## Open item

Logo Construction slide currently ships with a visual placeholder only. When the real construction SVG is provided, it replaces the placeholder markup in that slide's component — no structural change expected.

## Testing plan

- `pnpm dev` locally, hit `/brand-guidelines/print` directly in a browser to sanity-check every slide's layout before wiring Puppeteer.
- Hit `/api/brand-guidelines/pdf` locally (full `puppeteer` path) and confirm an 8-page, 16:9 PDF downloads with correct fonts/colors on each page.
- Click the "Download PDF" link on the live `/brand-guidelines` page end-to-end.
