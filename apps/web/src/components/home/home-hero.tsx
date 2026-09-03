import { Container, LinkButton } from "@tamil-ulagam/ui";

import { BrandMark } from "@/components/brand/brand-mark";
import { ParticleField } from "@/components/motion/particle-field";
import { homepageContent } from "@/content/homepage";

export function HomeHero() {
  const { hero } = homepageContent;

  return (
    <section
      aria-labelledby="home-title"
      className="gradient-aurora relative isolate overflow-hidden text-white"
    >
      <ParticleField count={70} />

      <div
        aria-hidden="true"
        data-motion-ambient
        className="bg-heritage-gold/12 motion-float pointer-events-none absolute -top-32 right-1/4 size-[28rem] rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        data-motion-ambient
        className="bg-vivid-maroon/18 motion-float pointer-events-none absolute -bottom-40 -left-24 size-[32rem] rounded-full blur-3xl [animation-delay:2.4s]"
      />

      <Container className="relative flex min-h-[min(760px,calc(100svh-5rem))] flex-col items-center justify-center py-20 text-center sm:py-24">
        <div data-motion-reveal="" className="relative grid place-items-center">
          <span
            aria-hidden="true"
            data-motion-ambient
            className="bg-heritage-gold/25 motion-halo absolute size-40 rounded-full blur-3xl"
          />
          <BrandMark orbit className="relative size-28 sm:size-32" />
        </div>

        <p className="text-heritage-gold/90 mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.7rem] font-bold tracking-[0.24em] uppercase">
          <span lang="ta" className="font-tamil text-sm tracking-normal">
            {hero.eyebrowTamil}
          </span>
          <span aria-hidden="true" className="text-heritage-gold/40">
            ◆
          </span>
          <span>{hero.eyebrowEnglish}</span>
        </p>

        <h1
          id="home-title"
          className="text-display text-gradient-gold mt-5 max-w-4xl text-balance"
        >
          {hero.title}
        </h1>

        <p className="mt-7 max-w-xl text-lg leading-8 text-white/65 sm:text-xl sm:leading-9">
          {hero.description}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <LinkButton
            href="/join"
            size="large"
            className="gradient-gold-leaf text-ink border-0 font-bold shadow-[0_0.75rem_2rem_rgba(214,168,75,0.32)] transition-transform hover:-translate-y-0.5"
          >
            Join Tamil Ulagam
          </LinkButton>
          <LinkButton
            href="/about"
            variant="secondary"
            size="large"
            className="hover:border-heritage-gold/60 border-white/20 bg-white/[0.06] text-white backdrop-blur-sm hover:bg-white/12 hover:text-white"
          >
            Explore our vision
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
