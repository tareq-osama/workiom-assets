// app/brand-guidelines/print/slides/Cover.tsx
import { Slide } from './shared';
import { BRAND_GRADIENT } from '@/lib/brand';

export function CoverSlide() {
  return (
    <Slide dark background={BRAND_GRADIENT} className="justify-between">
      <div className="flex items-center justify-between text-sm tracking-wide text-white/50">
        <span className="flex items-center gap-2.5 font-medium">
          <span className="h-3 w-3 rounded-full bg-white" />
          Workiom
        </span>
        <span className="font-medium">Volume 1.0</span>
        <span className="font-mono">01</span>
      </div>
      <div>
        <h1 className="text-[110px] font-bold leading-[0.95] text-white">Brand</h1>
        <h1 className="text-[110px] font-bold leading-[0.95] text-white/40">Guidelines</h1>
      </div>
      <p className="text-sm text-white/40">May 2026</p>
    </Slide>
  );
}
