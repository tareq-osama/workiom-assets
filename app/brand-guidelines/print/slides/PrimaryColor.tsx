import { Slide, SlideHeader } from './shared';
import {
  COLOR_PURPLE,
  COLOR_BLUE,
  COLOR_DARK_PURPLE,
  COLOR_VIOLET,
  COLOR_YELLOW,
  COLOR_LIGHT_GRAY,
  COLOR_BLACK,
  COLOR_WHITE,
  type BrandColor,
} from '@/lib/brand';

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

function ColorBlock({
  color,
  light = false,
  darkText = false,
}: {
  color: BrandColor;
  light?: boolean;
  darkText?: boolean;
}) {
  const useDarkText = light || darkText;
  const textCls = useDarkText ? 'text-slate-600' : 'text-white/80';
  return (
    <div
      className="flex-1 h-full flex flex-col rounded-xl overflow-hidden"
      style={{ border: light ? '1px solid #EAEAEA' : undefined }}
    >
      <div className="flex-1 relative" style={{ backgroundColor: color.hex }}>
        <span className={`absolute bottom-4 left-5 text-xs ${textCls}`}>HEX</span>
        <span className={`absolute bottom-4 right-5 text-xs font-mono ${textCls}`}>
          {color.hex.replace('#', '')}
        </span>
      </div>
      <div className="flex h-10">
        {tints(color.hex).map((t, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: t }} />
        ))}
      </div>
    </div>
  );
}

export function PrimaryColorSlide() {
  return (
    <Slide>
      <SlideHeader section="Color" page="14" />
      <h2 className="text-5xl font-semibold mb-2">Primary Color</h2>
      <div className="flex-1 flex items-center gap-10 mt-4">
        <p className="w-1/5 text-base text-slate-500 leading-relaxed">
          Our palette combines vibrant purples and blues with a bold yellow accent, grounded by clean neutrals.
        </p>
        <div className="flex-1 h-full flex flex-col gap-4">
          <div className="flex" style={{ flexGrow: 1.4 }}>
            <ColorBlock color={COLOR_PURPLE} />
          </div>
          <div className="flex-1 flex gap-4">
            <ColorBlock color={COLOR_BLUE} />
            <ColorBlock color={COLOR_DARK_PURPLE} />
            <ColorBlock color={COLOR_VIOLET} />
          </div>
          <div className="flex-1 flex gap-4">
            <ColorBlock color={COLOR_YELLOW} darkText />
            <ColorBlock color={COLOR_LIGHT_GRAY} light />
            <ColorBlock color={COLOR_BLACK} />
            <ColorBlock color={COLOR_WHITE} light />
          </div>
        </div>
      </div>
    </Slide>
  );
}
