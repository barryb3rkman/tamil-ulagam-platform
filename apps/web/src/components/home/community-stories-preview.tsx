import {
  Container,
  ImageWithFallback,
  LinkButton,
  Section,
} from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { homepageContent } from "@/content/homepage";

export function CommunityStoriesPreview() {
  return (
    <Section tone="ivory" aria-labelledby="stories-title">
      <Container size="wide">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div className="overflow-hidden">
            <ImageWithFallback
              asset={images.communityStories}
              fallbackLabel="Community stories editorial preview image"
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
              COMMUNITY STORIES
            </p>
            <h2
              id="stories-title"
              className="text-global-navy mt-4 max-w-xl text-4xl leading-[1.08] font-semibold tracking-[-0.035em] sm:text-5xl"
            >
              {homepageContent.stories.title}
            </h2>
            <p className="text-slate mt-6 max-w-xl text-lg leading-8">
              {homepageContent.stories.description}
            </p>
            <LinkButton
              href="/news"
              variant="text"
              className="mt-9 block w-fit"
            >
              Explore News and Stories{" "}
              <span aria-hidden="true" className="ml-2">
                ↗
              </span>
            </LinkButton>
          </div>
        </div>
      </Container>
    </Section>
  );
}
