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
