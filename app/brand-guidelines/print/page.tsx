import { CoverSlide } from './slides/Cover';
import { PrimaryLogoSlide } from './slides/PrimaryLogo';
import { LogoConstructionSlide } from './slides/LogoConstruction';
import { LogoScalingSlide } from './slides/LogoScaling';
import { LogoBackgroundsSlide } from './slides/LogoBackgrounds';
import { TypographySlide } from './slides/Typography';
import { PrimaryColorSlide } from './slides/PrimaryColor';
import { ClosingSlide } from './slides/Closing';

export default function BrandGuidelinesPrintPage() {
  return (
    <>
      <CoverSlide />
      <PrimaryLogoSlide />
      <LogoConstructionSlide />
      <LogoScalingSlide />
      <LogoBackgroundsSlide />
      <TypographySlide />
      <PrimaryColorSlide />
      <ClosingSlide />
    </>
  );
}
