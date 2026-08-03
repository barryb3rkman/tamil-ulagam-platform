# Legal pages composition

## Purpose and status

The public Privacy Policy and Terms of Use routes are draft policy foundations. They expose the questions that Tamil Ulagam must resolve before launch; they are not approved legal advice, evidence of compliance or binding terms for future services.

Both pages visibly state **Draft for Legal Review** and show the effective date and last-reviewed date as **Not yet approved**. Organisation and contact details remain **Pending confirmation**. The drafts must be replaced or materially updated after qualified legal, governance, security and operational review confirms the facts of the production service.

## Shared architecture

Typed content in `apps/web/src/content/legal.ts` is the single source for document status, sections, unresolved decisions, operational triggers, launch checklists and cross-document links. Shared Server Components under `apps/web/src/components/legal/` render both routes without storing JSX in content or introducing a generic page-builder system.

The composition is:

1. Document header with breadcrumb, status and unresolved publication details
2. Prominent draft-review notice
3. Table of contents and semantic document sections
4. Decision-required and operational-trigger panels where relevant
5. Launch review checklist
6. Final review notice and related-document navigation

## Privacy structure

The Privacy Policy distinguishes the current informational website from possible future information processing. It records current service limitations before outlining potential information categories, purposes, legal bases, safeguards, rights and operational dependencies. The closing checklist identifies the entity, jurisdiction, processing inventory, providers, transfers, retention, children’s-data approach, rights routes, cookies, security and legal review that remain unresolved.

The document deliberately does not name a controller, provider, hosting region, contact, regulator, legal basis, retention period or transfer mechanism. Those facts must come from approved operations rather than policy assumptions.

## Terms structure

The Terms of Use separate public informational content from membership, Tamil ID, chapters, events, publishing, payments and other planned services. Proposed acceptable-use principles are labelled as draft expectations. Government-ID, professional-service, partnership and availability boundaries are stated plainly, while intellectual-property, liability, consumer-rights, governing-law and dispute provisions remain marked for qualified review.

Service-specific terms must be introduced before any future operational workflow launches. The draft must not be stretched to govern products or relationships that have not been designed and approved.

## Visual hierarchy

The pages use a deep navy document header, warm ivory reading field, restrained maroon review notices and gold section numbering. Body copy stays within a comfortable reading measure. Borders and panels separate decisions without turning the document into a grid of decorative cards. No imagery, seals, signatures, certification marks or government visual language is used.

## Accessibility and responsive behaviour

Each route has one primary heading, semantic breadcrumb and document navigation, ordered and unordered lists, labelled complementary panels and visible keyboard focus. Section anchors include clearance for the sticky site header, and reduced-motion preferences disable smooth scrolling.

The table of contents is sticky only at desktop widths. It remains in normal flow on mobile and tablet layouts, where section numbering, headings, lists and decision panels stack without horizontal scrolling. Typography and spacing are designed to remain usable at the tested viewport range and at enlarged text sizes.

## Metadata and publication

Each page has an exact draft-specific title, description and canonical route. No legal structured data, approved effective date, organisation address or jurisdiction claim is published. The pages remain indexable under the existing public-site strategy because the draft status is explicit in both metadata and visible content.

Before these pages become governing documents, reviewers must confirm the production organisation, applicable law, systems, information flows, user procedures and service rules. Approved versions should then receive controlled effective and review dates, appropriate change notices and retained prior versions where required.
