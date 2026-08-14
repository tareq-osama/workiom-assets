import { Slide, SlideHeader } from './shared';
import { BRAND_GRADIENT } from '@/lib/brand';
import { WORKIOM_AI_INTRO, WORKIOM_AI_LOGO } from '@/lib/content';

export function WorkiomAISlide() {
  return (
    <Slide>
      <SlideHeader section="Workiom AI" page="12" />
      <h2 className="text-5xl font-semibold mb-2">Workiom AI</h2>
      <div className="flex-1 flex flex-col gap-8 mt-4">
        <p className="text-base text-slate-500 leading-relaxed max-w-2xl">{WORKIOM_AI_INTRO}</p>
        <div className="flex-1 grid grid-cols-2 gap-6">
          <div className="rounded-2xl bg-[#F7F7F7] border border-[#EAEAEA] flex items-center justify-center p-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={WORKIOM_AI_LOGO.colored} alt="Workiom AI on light" className="h-24 w-auto object-contain" />
          </div>
          <div className="rounded-2xl flex items-center justify-center p-10" style={{ background: BRAND_GRADIENT }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={WORKIOM_AI_LOGO.light} alt="Workiom AI on dark" className="h-24 w-auto object-contain" />
          </div>
        </div>
      </div>
    </Slide>
  );
}
