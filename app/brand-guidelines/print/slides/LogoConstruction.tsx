import { Slide, SlideHeader } from './shared';
import { COLOR_PURPLE } from '@/lib/brand';

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
            backgroundImage: `repeating-linear-gradient(0deg, rgba(${COLOR_PURPLE.rgb}, 0.08) 0px, rgba(${COLOR_PURPLE.rgb}, 0.08) 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, rgba(${COLOR_PURPLE.rgb}, 0.08) 0px, rgba(${COLOR_PURPLE.rgb}, 0.08) 1px, transparent 1px, transparent 32px)`,
          }}
        >
          <div
            className="border-2 border-dashed rounded-xl px-12 py-8 flex flex-col items-center gap-2 bg-white/70"
            style={{ borderColor: COLOR_PURPLE.hex }}
          >
            <span
              className="text-sm font-bold tracking-wide"
              style={{ color: COLOR_PURPLE.hex }}
            >
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
