import { Slide, SlideHeader } from './shared';

const ARABIC_SAMPLES = [
  { weight: 700, label: 'Bold', sample: 'استفد الآن من ميزات الذكاء الاصطناعي' },
  { weight: 500, label: 'Medium', sample: 'أنشئ سير العمل وأتمتها بسهولة تامة' },
  { weight: 400, label: 'Regular', sample: 'منصة عمل ذكية وقابلة للتخصيص لكل فريق' },
  { weight: 300, label: 'Light', sample: 'بسيطة وعصرية ومركزة على المنتج' },
] as const;

export function TypographyArabicSlide() {
  return (
    <Slide>
      <SlideHeader section="Typography — Arabic" page="14" />
      <h2 className="text-5xl font-semibold mb-2">Typography — Arabic</h2>
      <div className="flex-1 flex items-center gap-16 mt-4" dir="rtl">
        <div className="w-2/5 text-right" style={{ fontFamily: 'var(--font-ibm-plex-arabic)' }}>
          <p className="text-[52px] font-bold leading-tight text-slate-900">
            IBM Plex
            <br />
            Sans Arabic
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-4 text-sm">
          {ARABIC_SAMPLES.map((s) => (
            <div key={s.weight} className="flex items-center gap-6">
              <p
                className="text-slate-800 text-lg leading-relaxed text-right flex-1"
                style={{ fontWeight: s.weight, fontFamily: 'var(--font-ibm-plex-arabic)' }}
              >
                {s.sample}
              </p>
              <span className="w-20 text-xs font-mono text-slate-300 flex-shrink-0 text-left" dir="ltr">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}
