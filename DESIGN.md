# Cooked Finance design system

## Direction

Cooked Finance uses a warm editorial visual language: trustworthy enough for a
financial education product, distinctive enough to make a calculator feel
inviting. It should resemble an independent field guide rather than a bank
dashboard, fintech template, or casino-like score game.

## Core palette

| Role | Color |
| --- | --- |
| Canvas | #f5efe4 |
| Paper | #fffcf7 |
| Ink | #1c1914 |
| Body | #625d55 |
| Hairline | #d8cfc1 |
| Ember action | #bd4b2b |
| Amber highlight | #e2a23a |
| Sage positive | #3e6b5b |

Use ink for primary actions and result surfaces. Ember is a selective emphasis,
not a background wash. Sage communicates stability without turning the product
into a red-versus-green judgment system.

## Typography

- Editorial display: Georgia with moderate weight and tight tracking.
- Interface and body: self-hosted Geist Variable.
- Labels and numerical metadata: self-hosted Geist Mono Variable.
- Headlines are sentence case. Uppercase is reserved for short mono eyebrows.
- Body copy targets comfortable 65–75 character lines and generous line height.

## Layout

- Main container: 1220px maximum with fluid side gutters.
- Reading column: 790px maximum.
- Sections use generous vertical rhythm and hairline boundaries.
- Homepage hero is a two-column editorial split; it stacks below 920px.
- Results move from summary, to raw ratios, to factor breakdown, to action.
- Mobile controls keep at least 44px effective touch targets.

## Components

- Cards use paper, a quiet warm border, and restrained stacked shadow.
- Primary buttons are ink-filled pills; secondary buttons are paper with a
  stronger border.
- Inputs have persistent labels, contextual help, inline errors, and visible
  focus states.
- Data tables remain semantic and horizontally scroll only when unavoidable.
- Interactive results use text and shape as well as color.

## Product tone

Lead with clarity, then add restrained cooking language. Never shame people,
manufacture urgency, imply lender authority, or present a broad guidepost as a
personal requirement. Optional humor follows the useful analysis.

## Motion and accessibility

- Motion is used for result reveal and progress only.
- All motion respects reduced-motion preferences.
- Focus is never hidden.
- Do not use color alone to communicate a score or error.
- Decorative SVGs are hidden from assistive technology; meaningful graphics
  receive concise labels.

## Avoid

- Generic neon gradients, glassmorphism, stock-photo finance imagery, and
  template-style icon grids.
- Fake testimonials, population percentiles, invented credentials, or
  performance guarantees.
- Ad placeholders before monetization is actually enabled.
- Sending calculator inputs, results, or score bands to analytics or URLs.
