import { Slide, SlideHeader } from './shared';
import { BUSINESS_OVERVIEW } from '@/lib/content';

export function BusinessOverviewProblemSlide() {
  return (
    <Slide>
      <SlideHeader section="Business Overview" page="02" />
      <p className="text-xs font-semibold text-[#9635F0] uppercase tracking-wide mb-3">
        {BUSINESS_OVERVIEW.problem.eyebrow}
      </p>
      <h2 className="text-4xl font-semibold mb-8 max-w-3xl">{BUSINESS_OVERVIEW.problem.headline}</h2>
      <div className="flex-1 grid grid-cols-3 gap-6">
        {BUSINESS_OVERVIEW.problem.points.map((p) => (
          <div key={p.title} className="border border-[#EAEAEA] rounded-2xl p-6">
            <p className="text-base font-semibold text-slate-900 mb-2">{p.title}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
    </Slide>
  );
}
