# Premium motion and interaction system

## Assessment

Tamil Ulagam now uses one restrained motion language across the public website. Motion supports hierarchy, orientation and interaction feedback without changing the approved layouts, content meaning, route structure or image assets. The system is suitable for launch: it is progressively enhanced, keyboard-safe, reduced-motion complete and dependency-free.

## Principles

- Motion clarifies entry, hierarchy, state and interaction; it is not decoration for its own sake.
- Content is server-rendered and readable before the motion runtime starts, when motion APIs are unavailable and when JavaScript is disabled.
- Transitions use opacity and transforms. No effect changes document flow, scroll position or card-grid geometry.
- Repeated micro-animation is limited. Section and group reveals run once per route visit, then their observers are released.
- Mobile timing and staggering are deliberately quieter than desktop treatment.
- Legal warnings, static FAQs and the footer remain immediately readable.

## Tokens

The shared CSS foundation defines the following motion tokens:

| Token                         |                           Value | Purpose                                    |
| ----------------------------- | ------------------------------: | ------------------------------------------ |
| `--tu-motion-instant`         |                          100 ms | press feedback and immediate state changes |
| `--tu-motion-fast`            |                          180 ms | links, colours and small controls          |
| `--tu-motion-base`            |                          280 ms | menus, cards and header refinement         |
| `--tu-motion-medium`          |                          420 ms | route, hero and section reveals            |
| `--tu-motion-slow`            |                          560 ms | restrained image entry and crop movement   |
| `--tu-motion-reveal-distance` |                           20 px | maximum vertical section reveal distance   |
| `--tu-motion-hover-distance`  |                            3 px | maximum interactive-card lift              |
| `--tu-ease-standard`          |    `cubic-bezier(0.2, 0, 0, 1)` | direct interface feedback                  |
| `--tu-ease-premium`           | `cubic-bezier(0.16, 1, 0.3, 1)` | editorial entry and emphasis               |

## Shared architecture

`MotionRuntime` is the only site-wide reveal coordinator. It is a small client component mounted alongside the server-rendered application shell. The route content remains a server component tree. The runtime:

- detects motion preference and browser support;
- uses one `IntersectionObserver` for section and grouped-entry reveals;
- uses finite Web Animations API sequences with `fill: both` rather than a render loop;
- marks revealed targets complete and cancels finished animations so normal CSS restores `transform: none`, preventing persistent transformed containing blocks on long pages;
- unobserves every revealed target and disconnects during route cleanup;
- records an observer count on the root element for diagnostics;
- starts Roadmap viewport tracking only after the first user scroll, with a passive, one-time listener;
- removes all listeners and observers on cleanup.

The root streamed loading boundary was removed because it left the application at a skeleton when JavaScript was unavailable. Route entry motion now provides non-blocking continuity while preserving complete server-rendered route content.

## Motion treatments

### Route transitions

The persistent header and footer do not animate between routes. The route content receives a 420 ms opacity and 10 px vertical entry through the Web Animations API. There is no overlay, artificial delay or blank intermediary state. With reduced motion, the route transform is not created.

### Heroes

Hero copy uses a short editorial sequence: navigation or breadcrumb, heading, supporting copy and action group. Hero imagery enters with opacity and a maximum `1.015` scale. The sequence remains readable without animation and never places interaction behind an animation gate.

### Sections and grouped content

The shared `Section` primitive supplies a reveal hook. Sections enter over 420 ms and 20 px when they first reach the viewport. Selected pillar, initiative and related-initiative groups use a light desktop stagger capped at 165 ms; mobile removes the stagger. Static editorial lists are not individually animated.

### Cards and images

Only interactive cards use lift. Hover and keyboard focus-within apply a 3 px transform, restrained border emphasis and a modest shadow. Associated images scale to no more than `1.015`. Non-interactive editorial images do not lift or zoom. Because transforms do not affect layout, neighbouring cards and grid geometry remain stable.

### Buttons and links

Buttons and button-links share colour, border, shadow and 1 px pressed-state feedback. Text links retain a visible gold underline at rest and extend it on hover or focus. Directional arrows move 4 px only when their parent interaction is active. Existing focus rings remain authoritative and clearly visible.

### Header and mobile navigation

The header is sticky with a fixed minimum height, so its transition cannot move page content. After the top sentinel leaves the viewport, the header gains restrained translucency, blur, border definition and shadow. The mobile menu keeps its accessible button, Escape handling and first-link focus; it adds a 280 ms opacity and 8 px vertical transition, body scroll locking, a conventional menu-to-close icon transition and `inert` protection while closed.

### Roadmap

The first Roadmap phase is marked in server output. After meaningful scrolling, an `IntersectionObserver` advances the restrained gold phase rule to the phase occupying the review band. There is no pinned section, scroll interception or forced progress. The sequence remains a normal vertical document on mobile.

### FAQs, footer and legal pages

The existing FAQs remain static editorial content; no accordions were introduced. Footer motion is limited to link underline feedback and the footer is excluded from delayed reveal. The shared `Section` primitive exposes an explicit static mode. Privacy and Terms use it so they receive only the brief route entry; their long-form sections and warnings remain static, immediate and free of transformed containing blocks.

## Reduced motion and accessibility

The CSS `prefers-reduced-motion: reduce` branch disables smooth scrolling, transforms, scale, stagger, moving arrows and long transition or animation durations. The runtime independently checks the same preference and does not create route, reveal or Roadmap animation behavior. All content is immediately visible and functionality remains intact.

Focus order, semantic landmarks, skip-link behavior, heading order and screen-reader reading order are unchanged. The closed mobile panel is both `aria-hidden` and inert. Motion does not reorder content, steal route focus or create duplicate announcements.

## Performance and bundle impact

No dependency or animation library was added, and the lockfile is unchanged. The production client addition is one motion runtime source module (approximately 7.2 KB unminified) plus the header’s small scroll-state client logic; the existing mobile-navigation client component was extended rather than duplicated. Shared motion CSS and tokens account for approximately 10.9 KB total stylesheet source before production minification, including the pre-existing design foundation.

There is no continuous `requestAnimationFrame` loop, parallax, background video or heavy scroll handler. A single animation-frame callback schedules setup. The only scroll listener is passive and self-removing. Reveals use compositor-friendly opacity and transforms; header dimensions and card grid offsets remain stable. Approved source images and their loading behavior are unchanged.

## Review coverage

All 20 public routes were exercised at 375 × 812, 390 × 844, 430 × 932, 768 × 1024, 1024 × 768, 1280 × 800, 1440 × 1000 and 1920 × 1080. Static review captures cover all routes at 1440 × 1000 and 390 × 844. Targeted captures cover hero initial and completed states, card hover, button hover and focus, header top and scrolled states, mobile menu open, Roadmap progression and reduced motion.

The review found no horizontal overflow, hydration warnings, failed requests, blank transitions, permanent hidden content, header layout shift or hover-driven grid movement. The full server route content also remains present when JavaScript is disabled.

## Intentionally static areas

- FAQ answers and editorial definition lists
- legal warning emphasis and legal document structure
- footer entry
- non-interactive photography and concept imagery
- content whose meaning or reading order would not benefit from motion

## Remaining concerns and launch readiness

Motion depends on the Web Animations and Intersection Observer APIs for enhanced reveals. Unsupported browsers receive the complete static experience instead. As future interactive services are introduced, their motion should use these tokens and undergo the same reduced-motion, keyboard, layout-shift and observer-lifecycle review.

The current public website motion system is launch-ready within the present static public-site scope.
