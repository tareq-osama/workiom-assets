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
              {tints(c.hex).map((t, i) => (
                <div key={i} className="flex-1" style={{ backgroundColor: t }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Slide>
  );
}
