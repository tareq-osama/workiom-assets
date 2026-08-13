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

function Swatch({ color, light = false }: { color: BrandColor; light?: boolean }) {
  return (
    <div
      className="relative flex-1 rounded-xl overflow-hidden"
      style={{ backgroundColor: color.hex, border: light ? '1px solid #EAEAEA' : undefined }}
    >
      <div className="absolute bottom-4 left-5">
        <p className={`text-xs font-semibold mb-0.5 ${light ? 'text-slate-400' : 'text-white/70'}`}>
          {color.name}
        </p>
        <p className={`text-sm font-mono font-bold ${light ? 'text-slate-700' : 'text-white'}`}>
          {color.hex}
        </p>
      </div>
    </div>
  );
}

export function PrimaryColorSlide() {
  return (
    <Slide>
      <SlideHeader section="Color" page="07" />
      <h2 className="text-5xl font-semibold mb-2">Primary Color</h2>
      <p className="text-base text-slate-500 leading-relaxed mb-4 max-w-2xl">
        Our palette combines vibrant purples and blues with a bold yellow accent, grounded by clean neutrals.
      </p>
      <div className="flex-1 flex flex-col gap-4 mt-2">
        <div className="flex" style={{ flexGrow: 1.4 }}>
          <Swatch color={COLOR_PURPLE} />
        </div>
        <div className="flex-1 flex gap-4">
          <Swatch color={COLOR_BLUE} />
          <Swatch color={COLOR_DARK_PURPLE} />
          <Swatch color={COLOR_VIOLET} />
        </div>
        <div className="flex-1 flex gap-4">
          <Swatch color={COLOR_YELLOW} />
          <Swatch color={COLOR_LIGHT_GRAY} light />
          <Swatch color={COLOR_BLACK} />
          <Swatch color={COLOR_WHITE} light />
        </div>
      </div>
    </Slide>
  );
}
