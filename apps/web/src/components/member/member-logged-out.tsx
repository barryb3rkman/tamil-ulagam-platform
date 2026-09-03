import { JourneyLanding } from "@/components/join/journey-landing";
import { memberLoggedOutContent } from "@/content/member";

export function MemberLoggedOut() {
  return (
    <JourneyLanding
      eyebrow={memberLoggedOutContent.eyebrow}
      title={memberLoggedOutContent.title}
      description={memberLoggedOutContent.description}
      steps={memberLoggedOutContent.steps}
      stepsTitle="How connecting a membership works"
      stepsDescription="An affiliation claim, confirmed by the organisation you already belong to — never an open request anyone can approve."
      primaryLabel="Create account"
      returnTo="/join/member"
      backHref="/join"
      backLabel="← Back to Join Tamil Ulagam"
    />
  );
}
