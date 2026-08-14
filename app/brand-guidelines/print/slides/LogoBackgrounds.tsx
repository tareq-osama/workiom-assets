import { Slide, SlideHeader } from './shared';
import { LOGO_SRC, COLOR_NAVY, COLOR_PURPLE } from '@/lib/brand';

const BACKGROUNDS = [
  { label: 'On White', bg: '#FFFFFF', border: true, invert: false },
  { label: 'On Light Gray', bg: '#F4F4F4', border: false, invert: false },
  { label: 'On Navy', bg: COLOR_NAVY.hex, border: false, invert: true },
  { label: 'On Purple', bg: COLOR_PURPLE.hex, border: false, invert: true },
] as const;

export function LogoBackgroundsSlide() {
  return (
    <Slide>
      <SlideHeader section="Logo Backgrounds" page="12" />
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
