# Roadmap page composition

## Purpose

The Roadmap page explains how Tamil Ulagam can grow through responsible stages without presenting planned systems as active or committing to public delivery dates. It is a strategic public explanation, not a project-management dashboard or a technical implementation plan.

## Content source and sequence

`apps/web/src/content/roadmap.ts` is the authoritative phase source. It defines the ordered Public Foundation, Identity and Membership, Chapters, Organisations and Events, Knowledge, Wellbeing and Opportunity Services, Mobile Access and Member Communication, and Responsible Global Expansion phases. Page-specific strategic explanation, readiness, quality, participation and FAQ content lives separately in `roadmap-page.ts` without redefining phase names, order, statuses or routes.

## Presentation and integrity

The page moves from the current public foundation to the complete phase sequence, dependencies, platform layers, readiness gates, quality principles, adaptable details, participation, FAQ and final invitation. Current work is labelled as in development; later stages are planned, controlled-pilot or long-term direction. Dates, percentages, budgets, delivery commitments and active-service claims are excluded.

## Image, responsive and accessibility strategy

The approved Roadmap future image appears once in the hero as a conceptual future-direction visual and is the sole priority image. The layout becomes a clear vertical reading sequence on small screens. Ordered phases and gates, text-based status labels, semantic FAQ markup, visible focus styles, an anchor with header offset and a textual dependency sequence preserve accessibility without relying on arrows, motion or colour alone.

## Metadata, performance and motion

Route metadata uses the Roadmap image, canonical route and a staged-development description without release or availability claims. The page is statically generated, uses no timeline or animation library, and applies only existing reduced-motion-safe hover, focus and transition styles.
