import { Slide, SlideHeader } from './shared';
import { KEY_MESSAGING } from '@/lib/content';

export function KeyMessagingSupportiveSlide() {
  return (
    <Slide>
      <SlideHeader section="Key Messaging" page="06" />
      <h2 className="text-5xl font-semibold mb-8">Supportive Messages</h2>
      <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-5 content-start">
        {KEY_MESSAGING.supportiveMessages.map((m) => (
          <div key={m.title} className="border border-[#EAEAEA] rounded-2xl p-5">
            <p className="text-xs font-semibold text-[#9635F0] mb-2">{m.title}</p>
            <p className="text-sm font-semibold text-slate-900 mb-1.5">&quot;{m.quote}&quot;</p>
            <p className="text-xs text-slate-500 leading-relaxed">{m.body}</p>
          </div>
        ))}
      </div>
    </Slide>
  );
}
