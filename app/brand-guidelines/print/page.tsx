import { CoverSlide } from './slides/Cover';
import { BusinessOverviewProblemSlide } from './slides/BusinessOverviewProblem';
import { BusinessOverviewWhatIsSlide } from './slides/BusinessOverviewWhatIs';
import { BusinessOverviewMissionSlide } from './slides/BusinessOverviewMission';
import { KeyMessagingCoreSlide } from './slides/KeyMessagingCore';
import { KeyMessagingSupportiveSlide } from './slides/KeyMessagingSupportive';
import { BrandVoiceSlide } from './slides/BrandVoice';
import { PrimaryLogoSlide } from './slides/PrimaryLogo';
import { LogoConstructionSlide } from './slides/LogoConstruction';
import { LogoScalingSlide } from './slides/LogoScaling';
import { LogoBackgroundsSlide } from './slides/LogoBackgrounds';
import { WorkiomAISlide } from './slides/WorkiomAI';
import { TypographySlide } from './slides/Typography';
import { PrimaryColorSlide } from './slides/PrimaryColor';
import { ClosingSlide } from './slides/Closing';

export default function BrandGuidelinesPrintPage() {
  return (
    <>
      <CoverSlide />
      <BusinessOverviewProblemSlide />
      <BusinessOverviewWhatIsSlide />
      <BusinessOverviewMissionSlide />
      <KeyMessagingCoreSlide />
      <KeyMessagingSupportiveSlide />
      <BrandVoiceSlide />
      <PrimaryLogoSlide />
      <LogoConstructionSlide />
      <LogoScalingSlide />
      <LogoBackgroundsSlide />
      <WorkiomAISlide />
      <TypographySlide />
      <PrimaryColorSlide />
      <ClosingSlide />
    </>
  );
}
