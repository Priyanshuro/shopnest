# ShopNest Design System

## Brief
Fashion e-commerce platform connecting Tier-2/3 cities. Warm, accessible, trustworthy. Myntra's premium positioning + Meesho's friendliness. Bold geometric fonts, smooth micro-interactions, verified seller credibility.

## Aesthetic
Editorial, energetic, hyperlocal. Warm burnt orange accents on trust elements (verified badges, CTAs). Clean cream backgrounds. Charcoal text. Card-based layout with soft shadows. Mobile-first responsive.

## Color Palette

| Semantic     | Light L   | Light C   | Light H  | Dark L  | Dark C  | Dark H | Usage                    |
|--------------|-----------|-----------|----------|---------|---------|--------|--------------------------|
| Primary      | 0.62      | 0.19      | 34       | 0.75    | 0.15    | 34     | CTAs, verified badges    |
| Accent       | 0.62      | 0.19      | 34       | 0.75    | 0.15    | 34     | Discount tags, highlights|
| Secondary    | 0.92      | 0.025     | 60       | 0.22    | 0        | —      | Subtle warmth             |
| Background   | 0.985     | 0        | —        | 0.12    | 0        | —      | Page foundation          |
| Foreground   | 0.18      | 0        | —        | 0.93    | 0        | —      | Body text                |
| Card         | 1.0       | 0        | —        | 0.16    | 0        | —      | Product/seller cards     |
| Border       | 0.88      | 0.01      | 60       | 0.25    | 0.01     | 60     | Subtle dividers          |
| Destructive  | 0.55      | 0.22      | 25       | 0.65    | 0.19     | 22     | Warnings, errors         |

## Typography
- **Display**: Bricolage Grotesque (bold geometric, 700 weight for headings & CTAs)
- **Body**: Figtree (warm humanist, 400/500 for readable content)
- **Mono**: Geist Mono (badges, tags, small labels)

**Type Scale**: Hero 48px, Heading 32px, Subheading 24px, Large 16px, Body 14px, Small 12px

## Spacing & Rhythm
- **Radius**: 0.75rem (12px) — unified across cards, buttons, inputs
- **Density**: Generous 1.5rem gaps between sections, 1rem within cards
- **Grid**: 12-column mobile-first, breakpoints at 768px, 1024px, 1280px

## Structural Zones

| Zone        | Light Background | Dark Background | Border | Purpose                    |
|-------------|------------------|-----------------|--------|----------------------------|
| Header      | `bg-card`        | `bg-card`       | `border-b` | Logo, search, icons       |
| Hero        | Gradient overlay | Gradient overlay| None   | Full-screen image + CTA   |
| Content     | `bg-background`  | `bg-background` | None   | Product grid, main area   |
| Section Alt | `bg-muted/20`    | `bg-muted/30`   | None   | Trending, offers          |
| Footer      | `bg-card`        | `bg-card`       | `border-t` | Links, social            |

## Component Patterns
- **Product Card**: Image + title + price + hover zoom (scale-105) + verified badge + fast-delivery tag
- **Seller Card**: Shop image + name + rating + verified badge
- **CTA Button**: `btn-primary` class — burnt orange, rounded-lg, hover scale-105
- **Badges**: `badge-verified` (green), `badge-fast-delivery` (warm orange/10)
- **Input**: `bg-input`, rounded-lg, `border-border`, focus:ring-2 ring-accent

## Motion & Interaction
- **Hover Zoom**: Product cards scale-105 on hover (300ms ease-out)
- **Button Scale**: Active scale-95 (press feedback)
- **Fade Transitions**: 300ms fade-in/fade-out between page states
- **Smooth Easing**: cubic-bezier(0.4, 0, 0.2, 1) for all transitions

## Image Strategy
- **Hero**: Full-screen lifestyle (young people shopping) + dark gradient overlay
- **Products**: White/clean background or model wearing item, 1:1 or 4:5 aspect
- **Sellers**: Real shop/store images (NOT models)
- **Banners**: Offer/discount themed with warm accents
- **Source**: Unsplash/Pexels only, validated category match

## Constraints
- No raw hex colors or arbitrary Tailwind values
- All colors via OKLCH CSS variables
- Font families set in index.css, not overridden in components
- Icons: Lucide React only
- Dark mode intentional — tuned shadows, borders, text contrast
- No animations on text — only interactive elements & transitions

## Signature Detail
Verified seller badge system: Green pill-shaped badges with check icon, instantly conveys trust for hyperlocal marketplace. Fast delivery tag in warm orange accent, reinforces 24–48 hr promise.
