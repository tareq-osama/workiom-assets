import { Slide, SlideHeader } from './shared';
import { BRAND_VOICE_TRAITS } from '@/lib/content';

export function BrandVoiceSlide() {
  return (
    <Slide>
      <SlideHeader section="Brand Voice & Tone" page="07" />
      <h2 className="text-5xl font-semibold mb-8">Brand Voice &amp; Tone</h2>
      <div className="flex-1 grid grid-cols-3 gap-6 content-start">
        {BRAND_VOICE_TRAITS.map((t) => (
          <div key={t.title} className="border border-[#EAEAEA] rounded-2xl p-6">
            <p className="text-base font-semibold text-slate-900 mb-2">{t.title}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{t.body}</p>
          </div>
        ))}
      </div>
    </Slide>
  );
}
