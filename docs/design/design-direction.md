# Design direction

## Character

The design foundation should feel like a premium global federation: contemporary, editorial, culturally grounded, institutionally trustworthy, and human. It should express Tamil identity with restraint rather than relying on decorative stereotypes.

The core palette combines global navy and deep navy for trust, warm ivory for humanity, heritage maroon for cultural emphasis, and heritage gold for limited highlights. Interactive blue and semantic success, warning, and error colours remain functionally distinct.

## Typography

English and Tamil use separate CSS font tokens so either language can be refined without duplicating component rules. Inter provides the modern English sans-serif direction and Noto Sans Tamil provides dependable Tamil coverage. Both are configured through the Next.js font system with system fallbacks.

Tamil text must remain comfortably sized with appropriate line height. Mixed-language interfaces must not force Tamil glyphs through the English font stack.

## Layout and interaction

- Use large, measured typography and generous section spacing.
- Preserve readable line lengths and responsive container widths.
- Let media-led sections expand through the shared wide container instead of widening every text column.
- Use maroon and gold as accents, not large decorative surfaces.
- Prefer subtle borders, calm shadows, and small cultural details.
- Keep motion short, purposeful, and compatible with reduced-motion preferences.
- Maintain visible focus states, keyboard access, semantic landmarks, and sufficient contrast.

Avoid political-party visual cues, charity templates, generic corporate stock compositions, excessive temple imagery, neon technology styling, pervasive glass effects, excessive gradients, tiny Tamil typography, and heavy animation.

Homepage labels remain deliberately secondary but use consistent readable sizing and contrast at small viewport widths. The header and closing call to action may carry slightly stronger visual weight than information sections, while still preserving the calm institutional character.

The homepage extends this foundation with large editorial compositions, alternating media and copy, and a restrained visual rhythm inspired by contemporary international editorial sites. The referenced Heart theme informed only those broad qualities; Tamil Ulagam does not adopt its fundraising identity or exact structure: https://heart.axiomthemes.com/

The About page applies the same system as an institutional manifesto. It uses a composed internal-page hero, asymmetrical vision and mission panels, numbered editorial lists, a quiet Tamil cultural statement, and text-led participation closing. Approved media supports purpose, governance, and development-path sections rather than serving as decoration.

The Initiatives overview applies the system as an ecosystem explanation rather than a service catalogue. It uses a text-led internal hero with a restrained initiative montage, three numbered ecosystem groups, varied editorial media compositions, and a compact text-led directory. Deep navy sections distinguish opportunity and shared-foundation content; ivory and white sections provide calm reading rhythm. The page avoids a uniform card grid until the final directory, where consistency improves scanability.

Initiative detail pages extend the system through three related editorial variants. Human development pages use lighter ivory and white reading surfaces with calm trust panels; opportunity pages use deeper navy capability bands and structured pathway treatments; knowledge, culture and global-presence pages use richer maroon and gold accents with preservation-led rhythm. The variants retain the same typography, navigation, spacing, focus treatments and content integrity rules so they remain one public platform rather than separate brands.

The Tamil ID concept page presents a future membership credential with deep navy, restrained heritage gold, editorial typography and one approved credential showcase image. It is intentionally distinct from government portals, financial cards and active service interfaces. Public verification, private information and proposed membership states are separated clearly so trust is communicated without implying operational availability.

The Chapters page presents a planned global chapter network rather than a directory of operating locations. A wide conceptual global-network hero establishes the global/local relationship, while structured editorial lists explain formation, governance, chapter boundaries, readiness and future directory expectations. Deep navy sections carry the shared-standards and privacy message; ivory and white sections support deliberate public reading without map controls, flags or location claims.

The Roadmap page frames growth as a strategic sequence rather than a dated delivery plan. A single conceptual future-direction image leads the experience, followed by numbered phases, text-led dependencies, platform layers and readiness gates. The restrained navy, ivory and white rhythm keeps detailed planning legible without borrowing dashboard, Gantt-chart or progress-tracker conventions.

The Partners page presents responsible collaboration as a governed pathway, not as proof of affiliation. A single conceptual institutional image anchors the hero, while editorial lists distinguish discussion from approval, set due-diligence and data boundaries, and explain how future collaboration may support the broader ecosystem without logo walls or sponsor treatments.

The Events page presents a future discovery and participation model rather than a live calendar. A single approved Global Events image leads the experience; structured editorial sequences then distinguish organiser interest, verification, publishing, registration, attendance, privacy, status and readiness. Its navy, ivory and white rhythm keeps operational detail clear without borrowing ticketing, festival-poster or dashboard conventions.

The News page presents a future public newsroom rather than a live media surface. A single Community Stories image appears only as a captioned conceptual hero, while the page uses publication distinctions, ordered review stages and calm public-record treatments to explain how future announcements, stories, resources, updates and corrections may be governed. It avoids article grids, dates, bylines, filters, tickers and editorial activity claims.
