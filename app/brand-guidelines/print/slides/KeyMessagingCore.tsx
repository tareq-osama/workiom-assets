import { Slide, SlideHeader } from './shared';
import { BRAND_GRADIENT } from '@/lib/brand';
import { KEY_MESSAGING } from '@/lib/content';

export function KeyMessagingCoreSlide() {
  return (
    <Slide>
      <SlideHeader section="Key Messaging" page="05" />
      <h2 className="text-5xl font-semibold mb-8">Key Messaging</h2>
      <div className="flex-1 flex flex-col gap-8 justify-start">
        <div className="rounded-2xl p-10" style={{ background: BRAND_GRADIENT }}>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50 mb-3">Core Message</p>
          <p className="text-2xl font-semibold text-white leading-snug max-w-3xl">{KEY_MESSAGING.coreMessage}</p>
        </div>
        <div className="text-center py-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Tagline</p>
          <p className="text-4xl font-semibold text-slate-900">{KEY_MESSAGING.tagline}</p>
        </div>
      </div>
    </Slide>
  );
}
