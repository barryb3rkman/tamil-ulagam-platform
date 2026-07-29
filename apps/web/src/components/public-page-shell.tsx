import { Container, Section } from "@tamil-ulagam/ui";

import type { PublicPageContent } from "@/content/pages";

import { EmptyState } from "./empty-state";
import { PageHero } from "./page-hero";

export interface PublicPageShellProps {
  readonly content: PublicPageContent;
}

export function PublicPageShell({ content }: PublicPageShellProps) {
  return (
    <>
      <PageHero
        description={content.description}
        eyebrow={content.eyebrow}
        title={content.title}
      />
      <Section tone="white">
        <Container>
          <EmptyState
            title="Foundation content"
            description={
              content.notice ??
              "This page is intentionally concise while verified long-form content is prepared and reviewed."
            }
          />
        </Container>
      </Section>
    </>
  );
}
