import { Slide, SlideHeader } from './shared';
import { BUSINESS_OVERVIEW } from '@/lib/content';
import { BRAND_GRADIENT } from '@/lib/brand';

export function BusinessOverviewMissionSlide() {
  return (
    <Slide>
      <SlideHeader section="Business Overview" page="04" />
      <h2 className="text-5xl font-semibold mb-8">Mission &amp; Vision</h2>
      <div className="flex-1 grid grid-cols-2 gap-6">
        <div
          className="rounded-2xl p-10 text-white flex flex-col justify-center"
          style={{ background: BRAND_GRADIENT }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-4">Mission</p>
          <p className="text-2xl leading-relaxed">{BUSINESS_OVERVIEW.mission}</p>
        </div>
        <div className="rounded-2xl p-10 bg-[#F7F7F7] flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">Vision</p>
          <p className="text-2xl leading-relaxed text-slate-700">{BUSINESS_OVERVIEW.vision}</p>
        </div>
      </div>
    </Slide>
  );
}
