import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { tamilIdContent } from "@/content/tamil-id";

export function TamilIdDefinition() {
  const { definition, notGovernmentId } = tamilIdContent;

  return (
    <>
      <Section id="what-is-tamil-id" tone="white" className="scroll-mt-24">
        <Container
          size="wide"
          className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
        >
          <SectionHeading
            eyebrow={definition.eyebrow}
            title={definition.title}
          />
          <div>
            <p className="text-global-navy max-w-2xl text-xl leading-8 font-semibold sm:text-2xl sm:leading-9">
              {definition.description}
            </p>
            <ol className="border-global-navy/12 mt-10 grid border-t sm:grid-cols-2">
              {definition.principles.map((principle, index) => (
                <li
                  key={principle}
                  className="border-global-navy/12 grid gap-4 border-b py-5 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
                >
                  <span className="text-heritage-gold text-sm font-semibold tracking-[0.12em]">
                    0{index + 1}
                  </span>
                  <p className="text-charcoal leading-7">{principle}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>
      <Section tone="ivory" aria-labelledby="tamil-id-not-title">
        <Container
          size="wide"
          className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"
        >
          <SectionHeading
            eyebrow={notGovernmentId.eyebrow}
            title={notGovernmentId.title}
            description={notGovernmentId.description}
          />
          <div className="border-heritage-maroon/22 border-l-2 pl-6 sm:pl-8">
            <h2 id="tamil-id-not-title" className="sr-only">
              What Tamil ID is not
            </h2>
            <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {notGovernmentId.items.map((item) => (
                <li
                  key={item}
                  className="border-global-navy/12 text-charcoal border-b pb-4 leading-7"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>
    </>
  );
}
