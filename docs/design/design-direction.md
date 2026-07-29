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
