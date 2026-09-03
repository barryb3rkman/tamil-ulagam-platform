import { JourneyLanding } from "@/components/join/journey-landing";
import { organisationLoggedOutContent } from "@/content/organisation";

export function OrganisationLoggedOut() {
  return (
    <JourneyLanding
      eyebrow={organisationLoggedOutContent.eyebrow}
      title={organisationLoggedOutContent.title}
      description={organisationLoggedOutContent.description}
      steps={organisationLoggedOutContent.steps}
      stepsTitle="How organisation registration works"
      stepsDescription="One short registration, then a real federation review — the same verification standard every Tamil Ulagam organisation is held to."
      primaryLabel="Create account & begin"
      returnTo="/join/organisation"
      backHref="/join"
      backLabel="← Back to Join Tamil Ulagam"
    />
  );
}
