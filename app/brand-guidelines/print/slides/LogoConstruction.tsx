import { Slide, SlideHeader } from './shared';

export function LogoConstructionSlide() {
  return (
    <Slide>
      <SlideHeader section="Logo Construction" page="03" />
      <h2 className="text-5xl font-semibold mb-2">Logo Construction</h2>
      <div className="flex-1 flex items-center gap-16 mt-4">
        <p className="w-1/3 text-base text-slate-500 leading-relaxed">
          The logo is built on a fixed grid that governs proportion, spacing, and
          alignment between the mark and wordmark.
        </p>
        <div className="flex-1 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-construction.svg"
            alt="Workiom logo construction grid"
            className="w-full h-auto max-h-full"
          />
        </div>
      </div>
    </Slide>
  );
}
