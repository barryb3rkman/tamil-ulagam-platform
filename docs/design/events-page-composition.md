# Events page composition

## Purpose and relationship

The Events page explains the planned Tamil Ulagam event-discovery and participation model. It is distinct from the Global Events initiative page: the initiative describes a long-term programme area, while this page describes the governed operating model that future federation, chapter and organisation events may use. It is not a live calendar, ticketing surface or event-management portal.

## Content model

Typed content in `apps/web/src/content/events.ts` defines the platform vision, categories, organiser model, organiser pathway, conceptual publishing lifecycle, registration and attendance principles, privacy boundaries, organiser relationships, hybrid and archive safeguards, status model, safety, readiness, interest routes, FAQs and final call to action. No fictional event record, date, venue, speaker, organiser or availability is represented.

## Trust and privacy

The composition separates public event information from private attendee information. Organiser permissions are proposed as scoped, role-based and purpose-limited; publication does not grant broader authority or unrestricted member data access. Federation, chapter, organisation and partner-supported event roles remain distinct.

## Image, responsive and accessibility strategy

The approved Global Events registry image appears once as the conceptual hero and is the only priority image. Lists become vertical reading sequences on narrow screens; ordered organiser and lifecycle stages retain their structure without a horizontal mobile timeline. Semantic landmarks, headings, lists, text status labels, a captioned conceptual image, visible focus and static FAQ markup support accessible reading and keyboard use.

## Metadata, performance and motion

Route metadata uses the approved Global Events image and a planned-platform description without Event schema or availability claims. The static route introduces no dependency, calendar, map, ticketing surface or client interaction. Existing reduced-motion-safe link and media treatments remain the only motion.
