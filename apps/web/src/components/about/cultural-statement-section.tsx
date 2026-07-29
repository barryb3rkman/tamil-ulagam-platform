import { Container, Section } from "@tamil-ulagam/ui";

import { aboutContent } from "@/content/about";

export function CulturalStatementSection() {
  const { culturalStatement } = aboutContent;

  return (
    <Section
      tone="white"
      spacing="generous"
      aria-labelledby="cultural-statement-title"
    >
      <Container size="narrow" className="text-center">
        <div aria-hidden="true" className="bg-heritage-gold mx-auto h-1 w-14" />
        <blockquote className="mt-10">
          <h2
            id="cultural-statement-title"
            lang="ta"
            className="font-tamil text-global-navy text-4xl leading-[1.45] font-semibold tracking-[-0.025em] sm:text-5xl lg:text-6xl"
          >
            {culturalStatement.tamil}
          </h2>
          <p className="text-heritage-maroon mt-7 text-xl leading-8 font-medium sm:text-2xl">
            {culturalStatement.translation}
          </p>
          <footer className="text-slate mt-5 text-sm font-semibold tracking-[0.1em] uppercase">
            {culturalStatement.attribution}
          </footer>
        </blockquote>
        <p className="text-slate mx-auto mt-9 max-w-xl leading-7">
          {culturalStatement.reflection}
        </p>
      </Container>
    </Section>
  );
}
