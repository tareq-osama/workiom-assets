// app/brand-guidelines/print/slides/PrimaryLogo.tsx
import { Slide, SlideHeader } from './shared';
import { LOGO_SRC } from '@/lib/brand';

export function PrimaryLogoSlide() {
  return (
    <Slide>
      <SlideHeader section="Primary Logo" page="08" />
      <h2 className="text-5xl font-semibold mb-2">Primary Logo</h2>
      <div className="flex-1 flex items-center gap-16 mt-4">
        <p className="w-1/3 text-base text-slate-500 leading-relaxed">
          The primary lockup is the official logo and should be used in most brand
          applications. It combines the mark and the wordmark in a fixed relationship.
        </p>
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="Workiom" className="h-24 w-auto object-contain" />
          <div className="flex gap-24 text-xs text-slate-300 border-t border-[#EDEDED] pt-4 w-2/3 justify-center">
            <span>Logomark</span>
            <span>Logotype</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
