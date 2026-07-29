# Image asset map

The central registry is `apps/web/src/config/images.ts`. Components must consume registry entries and must not repeat paths. All 22 approved PNG files were verified and activated on 2026-07-28. The registry stores their intrinsic dimensions, intended ratio, crop position, loading priority, and responsive alternative metadata.

`ImageWithFallback` uses semantic picture switching for the home hero and retains a development fallback for a future missing or failed asset. Only the responsive home hero receives eager, high-priority loading; all other images remain lazy loaded.

| Area        | File                           | Intended ratio | Notes                                         |
| ----------- | ------------------------------ | -------------- | --------------------------------------------- |
| Home        | `home-hero-desktop.png`        | 16:9           | Above fold; has mobile alternative            |
| Home        | `home-hero-mobile.png`         | 9:16           | Mobile art direction for the hero             |
| Home        | `why-tamil-ulagam.png`         | 4:3            | Supporting editorial image                    |
| Home        | `final-cta.png`                | 16:9           | Closing image                                 |
| Pillars     | `pillar-connect.png`           | 3:4            | Connect                                       |
| Pillars     | `pillar-empower.png`           | 3:4            | Empower                                       |
| Pillars     | `pillar-preserve.png`          | 3:4            | Preserve                                      |
| Initiatives | `initiative-healthcare.png`    | 4:3            | Planned initiative                            |
| Initiatives | `initiative-education.png`     | 4:3            | Planned initiative                            |
| Initiatives | `initiative-business.png`      | 4:3            | Planned initiative                            |
| Initiatives | `initiative-jobs.png`          | 4:3            | Planned initiative                            |
| Initiatives | `initiative-research.png`      | 4:3            | Planned initiative                            |
| Initiatives | `initiative-tourism.png`       | 4:3            | Planned initiative                            |
| Initiatives | `initiative-arts-culture.png`  | 4:3            | Planned initiative                            |
| Initiatives | `initiative-global-events.png` | 4:3            | Planned initiative                            |
| Membership  | `tamil-id-showcase.png`        | 3:4            | Must remain clearly conceptual while planned  |
| Chapters    | `global-chapters.png`          | 16:9           | Planned network                               |
| Pages       | `partnerships.png`             | 4:3            | Must not imply unconfirmed partners           |
| Pages       | `community-stories.png`        | 4:3            | Must not imply fabricated testimonials        |
| Pages       | `about-hero.png`               | 16:9           | Lazy loaded until used in a final page design |
| Pages       | `roadmap-future.png`           | 16:9           | Future direction                              |
| Pages       | `mobile-app-preview.png`       | 3:4            | Must remain clearly conceptual                |

Alt text was reviewed against the approved compositions and avoids asserting identities, locations, organisational relationships, or active services. Decorative use should still provide empty alt text at the component boundary when the same information is already conveyed nearby.
