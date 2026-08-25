"use client";

import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Dialog,
  EmptyState,
  FormField,
  IconButton,
  ImageWithFallback,
  Input,
  descriptionId,
  RadioGroup,
  Select,
  Sheet,
  Skeleton,
  StageProgress,
  StatusBadge,
  Surface,
  Textarea,
} from "@tamil-ulagam/ui";
import { useState, useSyncExternalStore } from "react";

import { joinImages } from "@/config/join-images";

function ShowcaseSection({
  children,
  description,
  title,
}: {
  readonly children: React.ReactNode;
  readonly description?: string;
  readonly title: string;
}) {
  return (
    <section className="grid gap-6 py-10 first:pt-0">
      <div className="max-w-2xl">
        <h2 className="text-global-navy text-2xl font-bold tracking-[-0.015em] sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="text-slate mt-2 leading-7">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Swatch({
  name,
  token,
}: {
  readonly name: string;
  readonly token: string;
}) {
  return (
    <div className="grid gap-2">
      <div
        className="border-global-navy/10 h-16 rounded-lg border"
        style={{ backgroundColor: `var(${token})` }}
      />
      <div>
        <p className="text-charcoal text-sm font-semibold">{name}</p>
        <p className="text-metadata font-mono">{token}</p>
      </div>
    </div>
  );
}

function GradientSwatch({
  className,
  name,
  usage,
}: {
  readonly className: string;
  readonly name: string;
  readonly usage: string;
}) {
  return (
    <div className="grid gap-2">
      <div className={`h-28 rounded-xl ${className}`} />
      <div>
        <p className="text-charcoal text-sm font-semibold">{name}</p>
        <p className="text-metadata">{usage}</p>
      </div>
    </div>
  );
}

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Reads and subscribes to the live OS/browser reduced-motion
 * preference — a `useSyncExternalStore` read of an external browser API
 * is the correct pattern here (React's own guidance) rather than
 * setState-in-effect, and it's SSR-safe via the server-snapshot arg
 * (this static-export build prerenders this component with no
 * `window`; the server snapshot always reports "no preference" and the
 * client corrects it on hydration, matching how the rest of this app's
 * motion runtime already treats reduced motion as a progressive,
 * client-only enhancement). */
function useReducedMotionPreference(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export function DesignSystemShowcase() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [stage, setStage] = useState(2);
  const [radioValue, setRadioValue] = useState("informal");
  const [skeletonVisible, setSkeletonVisible] = useState(true);
  const prefersReducedMotion = useReducedMotionPreference();
  const stages = ["Identity", "Reachability", "Confirmation"];

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
      <header className="mb-4 grid gap-3">
        <Badge tone="maroon" className="w-fit">
          Internal QA surface — not linked in navigation
        </Badge>
        <h1 className="text-display text-global-navy">Design system</h1>
        <p className="text-slate max-w-2xl text-lg leading-8">
          Phase B1 foundations: color, gradients, surfaces, typography, motion,
          and the primitives Phase C+ will build product journeys from. Nothing
          on this page is wired to real product data.
        </p>
        <p
          role="status"
          className="text-metadata border-global-navy/10 w-fit rounded-full border bg-white px-3 py-1.5"
        >
          Reduced motion:{" "}
          <strong className="text-charcoal">
            {prefersReducedMotion ? "on" : "off"}
          </strong>{" "}
          (reflects your OS/browser setting live)
        </p>
      </header>

      <div className="divide-global-navy/10 divide-y">
        <ShowcaseSection
          title="Typography"
          description="Display is reserved for rare, high-impact moments — it appears exactly once on this entire page, above. Page title and section heading (used throughout this showcase) are unchanged from the current app."
        >
          <div className="grid gap-5">
            <div>
              <p className="text-global-navy text-4xl font-semibold tracking-[-0.025em] sm:text-5xl">
                Page title
              </p>
              <p className="text-metadata">
                Every screen&rsquo;s H1 — unchanged from the current app.
              </p>
            </div>
            <div>
              <p className="text-global-navy text-2xl font-bold tracking-[-0.015em]">
                Section heading
              </p>
              <p className="text-metadata">Unchanged from the current app.</p>
            </div>
            <div>
              <p className="text-charcoal text-base leading-7">
                Body text — the default reading scale, unchanged from the
                current app. Used for descriptions, paragraphs, and general
                content.
              </p>
            </div>
            <div className="flex flex-wrap items-baseline gap-6">
              <div>
                <p className="text-label text-global-navy">Label</p>
                <p className="text-metadata">Form labels, nav items</p>
              </div>
              <div>
                <p className="text-metadata">Metadata — submitted 3 days ago</p>
                <p className="text-metadata">Timestamps, reference IDs</p>
              </div>
              <div>
                <p className="text-numeric text-2xl font-bold">1,024</p>
                <p className="text-metadata">Numeric / tabular metric</p>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          title="Color"
          description="Foundation palette (unchanged) plus the four V3 supporting tokens, which exist to mix gradients and tint Deep-surface accents — not to become standalone UI colors."
        >
          <div>
            <p className="text-label text-slate mb-3">Foundation</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <Swatch name="Global navy" token="--tu-color-global-navy" />
              <Swatch name="Deep navy" token="--tu-color-deep-navy" />
              <Swatch
                name="Heritage maroon"
                token="--tu-color-heritage-maroon"
              />
              <Swatch name="Heritage gold" token="--tu-color-heritage-gold" />
              <Swatch name="Warm ivory" token="--tu-color-warm-ivory" />
            </div>
          </div>
          <div>
            <p className="text-label text-slate mb-3">V3 supporting palette</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Swatch name="Indigo depth" token="--tu-color-indigo-depth" />
              <Swatch name="Crimson ember" token="--tu-color-crimson-ember" />
              <Swatch name="Champagne" token="--tu-color-champagne" />
              <Swatch name="Teal depth" token="--tu-color-teal-depth" />
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          title="Named gradients"
          description="Exactly four, each with one documented job — a screen reaches for one by name rather than blending its own stops."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <GradientSwatch
              className="gradient-federation-night"
              name="Federation Night"
              usage="Deep hero moments — a future /join hub, admin operations header."
            />
            <GradientSwatch
              className="gradient-warm-welcome"
              name="Warm Welcome"
              usage="Onboarding stage backgrounds, completion screens."
            />
            <GradientSwatch
              className="gradient-sangam-dusk"
              name="Sangam Dusk"
              usage="Tamil Sangam-specific hero/banner moments only."
            />
            <GradientSwatch
              className="gradient-trust-signal"
              name="Trust Signal"
              usage="Verification/trust surfaces — a verified state, a duplicate-signal banner."
            />
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          title="Surfaces"
          description="Exactly four. Elevated is reserved for the one primary action area a screen has — using it more than once per screen defeats the purpose."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Surface
              level="canvas"
              density="comfortable"
              className="rounded-xl"
            >
              <p className="text-label text-global-navy">Canvas</p>
              <p className="text-metadata mt-1">The page background.</p>
            </Surface>
            <Surface level="card" density="comfortable">
              <p className="text-label text-global-navy">Card</p>
              <p className="text-metadata mt-1">The workhorse surface.</p>
            </Surface>
            <Surface level="elevated" density="comfortable">
              <p className="text-label text-global-navy">Elevated</p>
              <p className="text-metadata mt-1">One per screen, at most.</p>
            </Surface>
            <Surface level="deep" density="comfortable">
              <p className="text-label text-white">Deep</p>
              <p className="mt-1 text-sm text-white/70">
                Hero/identity moments only.
              </p>
            </Surface>
          </div>
          <Surface
            level="deep"
            density="comfortable"
            className="gradient-federation-night relative overflow-hidden"
          >
            <div data-motion-ambient className="absolute inset-0 opacity-40" />
            <div className="relative grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-label text-white/70">Glass over Deep</p>
                <p className="mt-1 text-white">
                  The glass variant is constrained to layering over Deep or
                  gradient surfaces — never over plain Canvas.
                </p>
              </div>
              <Surface level="deep" glass className="w-fit px-4 py-3">
                <p className="text-numeric text-2xl font-bold text-white">
                  128
                </p>
                <p className="text-xs text-white/70">verified organisations</p>
              </Surface>
            </div>
          </Surface>
        </ShowcaseSection>

        <ShowcaseSection title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <IconButton aria-label="Example icon action">
              <span aria-hidden="true">＋</span>
            </IconButton>
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          title="Form primitives"
          description="Input/Textarea/Select are bare controls composed with FormField; Checkbox and RadioGroup are self-contained, since their label is intrinsic to the control."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="showcase-name" label="Organisation name" required>
              <Input id="showcase-name" placeholder="Toronto Tamil Sangam" />
            </FormField>
            <FormField
              id="showcase-email"
              label="Official email"
              required
              error="Enter a valid email address."
            >
              <Input
                id="showcase-email"
                type="email"
                aria-invalid
                aria-describedby={descriptionId("showcase-email")}
                placeholder="office@example.org"
              />
            </FormField>
            <FormField
              id="showcase-category"
              label="Category"
              helperText="Choose the closest match."
            >
              <Select
                id="showcase-category"
                options={[
                  { value: "sangam", label: "Tamil Sangam" },
                  { value: "education", label: "Education" },
                  { value: "healthcare", label: "Healthcare" },
                ]}
              />
            </FormField>
            <FormField
              id="showcase-description"
              label="Short description"
              helperText="A sentence or two is enough."
            >
              <Textarea
                id="showcase-description"
                rows={3}
                placeholder="A Tamil community organisation serving..."
              />
            </FormField>
          </div>
          <Checkbox
            id="showcase-consent"
            label="I confirm that I am authorised to represent this organisation."
          />
          <RadioGroup
            label="Is this organisation formally registered?"
            name="showcase-registered"
            value={radioValue}
            onChange={(event) => setRadioValue(event.target.value)}
            options={[
              { value: "registered", label: "Registered organisation" },
              { value: "informal", label: "Unregistered / informal" },
            ]}
          />
        </ShowcaseSection>

        <ShowcaseSection title="Status badges">
          <div className="flex flex-wrap gap-3">
            <StatusBadge tone="neutral" label="Draft" />
            <StatusBadge tone="warning" label="Under review" />
            <StatusBadge tone="maroon" label="Changes requested" />
            <StatusBadge tone="success" label="Verified" />
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          title="Stage progress"
          description="A named-stage indicator — the connecting line to a completed stage animates its fill rather than snapping."
        >
          <StageProgress stages={stages} currentStage={stage} />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setStage((value) => Math.max(1, value - 1))}
            >
              Back
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() =>
                setStage((value) => Math.min(stages.length, value + 1))
              }
            >
              Advance
            </Button>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Alerts">
          <div className="grid gap-3">
            <Alert tone="info" title="Possible duplicate">
              Official email matches another organisation. You can still submit
              — a reviewer will confirm before verifying.
            </Alert>
            <Alert tone="warning">Your session will expire soon.</Alert>
            <Alert tone="error" role="alert">
              The request could not be completed. Please try again.
            </Alert>
            <Alert tone="success">Verification complete.</Alert>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Empty state">
          <EmptyState
            title="No membership requests yet"
            description="When someone requests to join this organisation, it will appear here for review."
            action={<Button size="small">Invite a member</Button>}
          />
        </ShowcaseSection>

        <ShowcaseSection
          title="Skeleton"
          description="Dimensionally matched to final content so nothing shifts layout when it swaps in."
        >
          <Button
            variant="secondary"
            size="small"
            onClick={() => setSkeletonVisible((value) => !value)}
          >
            {skeletonVisible ? "Show content" : "Show skeleton"}
          </Button>
          <div
            role="status"
            aria-label="Loading example"
            className="grid gap-3"
          >
            {skeletonVisible ? (
              <>
                <Skeleton shape="text" className="w-1/3" />
                <Skeleton shape="block" className="h-24 w-full" />
              </>
            ) : (
              <Surface level="card" density="comfortable">
                <p className="text-global-navy font-bold">Loaded content</p>
                <p className="text-slate mt-1 text-sm">
                  This is the shape the skeleton above was standing in for.
                </p>
              </Surface>
            )}
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          title="Dialog & Sheet"
          description="Both are controlled wrappers over the native <dialog> element — focus trap and Escape-to-close come from the browser, not from custom JS."
        >
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setDialogOpen(true)}>
              Open dialog
            </Button>
            <Button variant="secondary" onClick={() => setSheetOpen(true)}>
              Open sheet
            </Button>
          </div>
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Verify this organisation?"
          >
            <p className="text-slate leading-7">
              Confirm that the reviewed information meets the current
              verification requirements.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
            </div>
          </Dialog>
          <Sheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title="Switch workspace"
            side="bottom"
          >
            <p className="text-slate leading-7">
              A drawer/sheet foundation — bottom-anchored here, or
              `side=&quot;right&quot;` for a desktop drawer.
            </p>
          </Sheet>
        </ShowcaseSection>

        <ShowcaseSection
          title="Pilot visual assets"
          description="The three /join pilot images, wired through the same ImageWithFallback + config pattern every other screen's imagery already uses — nothing bespoke for these. Each renders its placeholder automatically if its file is ever missing."
        >
          <div className="grid gap-6 sm:grid-cols-3">
            <figure className="grid gap-2">
              <ImageWithFallback
                asset={joinImages.joinHubHero}
                className="rounded-card"
              />
              <figcaption className="text-metadata">
                join-hub-hero.png — /join entry hero
              </figcaption>
            </figure>
            <figure className="grid gap-2">
              <ImageWithFallback
                asset={joinImages.organisationJourneyHero}
                className="rounded-card"
              />
              <figcaption className="text-metadata">
                organisation-journey-hero.png — /join/organisation
              </figcaption>
            </figure>
            <figure className="grid gap-2">
              <ImageWithFallback
                asset={joinImages.sangamJourneyHero}
                className="rounded-card"
              />
              <figcaption className="text-metadata">
                sangam-journey-hero.png — /join/sangam
              </figcaption>
            </figure>
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          title="Motion"
          description="Reveal on scroll and masked hero reveal. Both respect prefers-reduced-motion automatically (toggle it in your OS/browser settings — the indicator at the top of this page reflects it live)."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div
              data-motion-reveal=""
              className="surface-card density-comfortable"
            >
              <p className="text-global-navy font-bold">Scroll reveal</p>
              <p className="text-slate mt-1 text-sm">
                Scroll this out of view and back to see it replay on next load —
                the runtime observes it once per page load.
              </p>
            </div>
            <div
              data-motion-mask=""
              className="gradient-sangam-dusk h-32 rounded-xl"
            />
          </div>
        </ShowcaseSection>
      </div>
    </div>
  );
}
