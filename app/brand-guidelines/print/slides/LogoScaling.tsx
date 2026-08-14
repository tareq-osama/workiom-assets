import { Slide, SlideHeader } from './shared';
import { LOGO_SRC } from '@/lib/brand';

const SIZES = [32, 64, 96, 160] as const;

export function LogoScalingSlide() {
  return (
    <Slide>
      <SlideHeader section="Logo Scaling" page="10" />
      <h2 className="text-5xl font-semibold mb-2">Logo Scaling</h2>
      <div className="flex-1 flex items-center gap-16 mt-4">
        <p className="w-1/4 text-base text-slate-500 leading-relaxed">
          Logo should scale proportionally and remain legible across all media.
          Minimum digital height is 32px.
        </p>
        <div className="flex-1 flex flex-col gap-6 justify-center">
          {SIZES.map((size) => (
            <div key={size} className="flex items-center gap-6">
              <span className="w-20 text-sm text-slate-300 font-mono">{size} px</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_SRC}
                alt="Workiom"
                style={{ height: size }}
                className="w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}
