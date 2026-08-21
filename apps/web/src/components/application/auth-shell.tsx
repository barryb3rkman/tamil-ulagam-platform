import { ImageWithFallback } from "@tamil-ulagam/ui";
import Link from "next/link";
import type { ReactNode } from "react";

import { images } from "@/config/images";

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
}: {
  readonly children: ReactNode;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
}) {
  return (
    <section className="bg-warm-ivory min-h-[calc(100vh-4rem)] px-5 py-5 sm:px-7 sm:py-7 lg:px-10 lg:py-9">
      <div className="mx-auto w-full max-w-[84rem]">
        <div className="mb-5 flex items-center justify-between gap-4 sm:mb-7">
          <Link
            href="/"
            className="focus-visible:ring-focus flex items-center gap-3 rounded-sm"
            aria-label="Tamil Ulagam home"
          >
            <span
              aria-hidden="true"
              className="border-heritage-gold text-global-navy grid size-10 place-items-center rounded-full border text-sm font-bold"
            >
              TU
            </span>
            <span className="leading-tight">
              <span className="text-global-navy block text-sm font-bold sm:text-base">
                Tamil Ulagam
              </span>
              <span className="text-heritage-maroon block text-[0.68rem] font-bold tracking-[0.12em] uppercase sm:text-xs">
                Organisation Portal
              </span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-global-navy focus-visible:ring-focus decoration-heritage-gold min-h-11 items-center text-sm font-semibold underline decoration-2 underline-offset-4 sm:inline-flex"
          >
            Back to website
          </Link>
        </div>

        <div className="rounded-large border-global-navy/10 shadow-navigation grid overflow-hidden border bg-white lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="bg-deep-navy hidden overflow-hidden lg:flex lg:flex-col">
            <ImageWithFallback
              asset={images.portalAuthHero}
              className="h-auto w-full shrink-0"
              priority
              sizes="(min-width: 1344px) 33.6rem, (min-width: 1024px) 40vw, 1px"
              style={{ objectFit: "contain" }}
            />
            <div className="bg-deep-navy border-heritage-gold/20 flex flex-1 flex-col justify-center border-t p-8 text-white xl:p-9">
              <p className="font-tamil text-lg text-white" lang="ta">
                ஒன்றிணைவோம் · உயர்வோம்
              </p>
              <p className="mt-2 max-w-lg text-sm leading-6 text-white/68">
                One trusted place to represent your organisation and follow its
                enrollment journey.
              </p>
            </div>
          </div>

          <div className="flex items-center p-6 sm:p-9 lg:p-11 xl:p-14">
            <div className="w-full">
              <p className="text-heritage-maroon text-xs font-bold tracking-[0.16em] uppercase">
                {eyebrow}
              </p>
              <h1 className="text-global-navy mt-4 text-4xl leading-[1.05] font-bold tracking-[-0.035em] sm:text-5xl">
                {title}
              </h1>
              <p className="text-slate mt-4 max-w-xl leading-7">
                {description}
              </p>
              <div className="border-global-navy/10 mt-7 border-t pt-7">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
