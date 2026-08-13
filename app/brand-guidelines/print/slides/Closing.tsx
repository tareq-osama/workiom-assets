// app/brand-guidelines/print/slides/Closing.tsx
import { Slide } from './shared';
import { BRAND_GRADIENT } from '@/lib/brand';

export function ClosingSlide() {
  return (
    <Slide dark background={BRAND_GRADIENT} className="justify-center items-center text-center">
      <p className="text-4xl font-semibold text-white mb-4">
        Need help applying the Workiom brand?
      </p>
      <p className="text-lg text-white/60">
        Contact the brand team for guidance, approvals, or custom assets.
      </p>
      <p className="text-lg text-white mt-8 font-medium">brand@workiom.com</p>
    </Slide>
  );
}
