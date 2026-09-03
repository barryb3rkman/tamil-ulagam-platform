import { joinHeroContent } from "@/content/join";

import { JourneyMasthead } from "./journey-masthead";

export function JoinHero() {
  return (
    <JourneyMasthead
      eyebrow={joinHeroContent.eyebrow}
      title={joinHeroContent.title}
      description={joinHeroContent.description}
    />
  );
}
