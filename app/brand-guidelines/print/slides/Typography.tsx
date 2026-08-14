import { Slide, SlideHeader } from './shared';
import { TYPOGRAPHY_SAMPLES } from '@/lib/brand';

export function TypographySlide() {
  return (
    <Slide>
      <SlideHeader section="Typography" page="13" />
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
        <div className="flex-1 flex flex-col gap-4 text-sm">
          {TYPOGRAPHY_SAMPLES.map((s) => (
            <div key={s.label} className="flex items-center gap-6">
              <span className="w-24 text-xs font-mono text-slate-300 flex-shrink-0">{s.label}</span>
              <p
                className="text-slate-800 truncate text-lg leading-tight"
                style={{ fontWeight: s.weight, fontFamily: "'General Sans', sans-serif" }}
              >
                {s.sample}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}
