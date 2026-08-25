import { Container, ImageWithFallback } from "@tamil-ulagam/ui";
import Link from "next/link";

import { joinImages } from "@/config/join-images";

import { SangamMark } from "./journey-icons";

const steps = [
  {
    title: "Register your Sangam's profile",
    description:
      "Your Sangam's name, location, leadership and founding details — the same rigor as an organisation record.",
  },
  {
    title: "Verification and review",
    description:
      "A federation reviewer confirms the details before your Sangam goes live, the same review path organisations go through today.",
  },
  {
    title: "Join the Sangam network",
    description:
      "Your Sangam gets its own presence within Tamil Ulagam and appears in the wider Sangam network.",
  },
];

/**
 * A deliberate pre-launch state for the Tamil Sangam journey — not a
 * generic "Coming Soon" page and not a fake submission form. It states
 * plainly what exists today and previews the real future model, per
 * the Phase C1 brief.
 */
export function SangamJourneyPage() {
  return (
    <>
      <section
        aria-labelledby="sangam-journey-title"
        className="gradient-sangam-dusk relative overflow-hidden text-white"
      >
        <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-center lg:py-24">
          <div data-motion-reveal="">
            <span
              aria-hidden="true"
              className="bg-heritage-gold/15 text-heritage-gold grid size-12 place-items-center rounded-full"
            >
              <SangamMark className="size-6" />
            </span>
            <p className="text-heritage-gold mt-6 text-xs font-bold tracking-[0.16em] uppercase">
              TAMIL SANGAMS
            </p>
            <h1
              id="sangam-journey-title"
              className="mt-4 text-4xl font-bold tracking-[-0.02em] text-balance sm:text-5xl"
            >
              Register a Tamil Sangam
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-white/85">
              Join the wider Tamil Sangam network and establish your
              Sangam&rsquo;s presence within Tamil Ulagam.
            </p>
            <div className="mt-7">
              {/* StatusBadge's neutral tone is charcoal-on-slate, tuned for
                  light surfaces — unreadable on this dark gradient hero.
                  `surface-glass` is the token built for exactly this case
                  ("a frosted stat chip over a hero"), so this pill uses it
                  directly rather than a Badge tone meant for Canvas/Card. */}
              <span className="surface-glass inline-flex w-fit items-center gap-2 px-3 py-1.5 text-xs leading-5 font-semibold tracking-wide">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-current"
                />
                In development
              </span>
            </div>
          </div>
          <div className="rounded-card overflow-hidden">
            <ImageWithFallback
              asset={joinImages.sangamJourneyHero}
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="aspect-[4/3] w-full"
            />
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="sangam-journey-how-title"
        className="surface-canvas py-16 sm:py-20"
      >
        <Container>
          <h2
            id="sangam-journey-how-title"
            className="text-global-navy text-2xl font-bold tracking-[-0.01em] sm:text-3xl"
          >
            How Sangam registration will work
          </h2>
          <p className="text-slate mt-3 max-w-2xl leading-7">
            Tamil Sangams share the same federation foundation as organisations
            — the same verification standard, the same reviewer process — with a
            registration experience built for how Sangams actually operate.
          </p>
          <ol className="mt-10 grid gap-5 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="surface-card p-6">
                <span className="text-heritage-maroon text-sm font-bold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-global-navy mt-3 text-base font-bold">
                  {step.title}
                </p>
                <p className="text-slate mt-2 text-sm leading-6">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/contact"
              className="bg-global-navy rounded-button hover:bg-deep-navy focus-visible:ring-focus inline-flex min-h-11 items-center px-5 py-2.5 font-semibold text-white focus-visible:outline-none"
            >
              Tell us about your Sangam
            </Link>
            <Link
              href="/join"
              className="text-global-navy focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline"
            >
              ← Back to Join Tamil Ulagam
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
