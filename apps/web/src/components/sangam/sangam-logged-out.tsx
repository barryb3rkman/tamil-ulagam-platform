import { JourneyLanding } from "@/components/join/journey-landing";
import { sangamLoggedOutContent } from "@/content/sangam";

export function SangamLoggedOut() {
  return (
    <JourneyLanding
      eyebrow={sangamLoggedOutContent.eyebrow}
      title={sangamLoggedOutContent.title}
      description={sangamLoggedOutContent.description}
      steps={sangamLoggedOutContent.steps}
      stepsTitle="How Sangam registration works"
      stepsDescription="Tamil Sangams share the same federation foundation as organisations — the same verification standard, the same reviewer process — with a registration experience built for how Sangams actually operate."
      primaryLabel="Create account & begin"
      returnTo="/join/sangam"
      backHref="/join"
      backLabel="← Back to Join Tamil Ulagam"
    />
  );
}
