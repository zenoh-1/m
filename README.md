# Cooked Finance — Are You Financially Cooked?

A fun-but-credible financial health scoring tool. Answer 4 questions, get a
0–100 **Cooked Score**, a percentile, a financial age, a personalized roast,
and a downloadable share card — all in under 60 seconds.

> For entertainment and educational purposes only. Not financial advice.

## Stack

- **Astro** (static, zero server) — one page, one client island
- **Tailwind CSS v4** (CSS-first `@theme` config via `@tailwindcss/vite`)
- **TypeScript** for all logic
- **Geist + Geist Mono** self-hosted variable fonts (no external font requests)
- Fully client-side. No auth, no DB, no APIs, no tracking.

## Design

Dark-first interpretation of the Vercel design language (see `DESIGN.md`):
mesh-gradient backdrop as the only decoration, Geist typography with negative
tracking, hairline borders, subtle stacked elevation, pill CTAs.

## Project structure

```
src/
  data/benchmarks.json     # US benchmark anchors (SCF-inspired) + scoring config
  lib/
    scoring.ts             # Cooked Score, percentile, financial age
    roasts.ts              # 36 rule-based roast templates + insights
    format.ts              # USD / compact formatting helpers
  components/
    Hero.astro             # Headline, tagline, CTA, example metrics
    AssessmentForm.astro   # The 4-input quick check
    ScoreGauge.astro       # Animated 0–100 SVG gauge
    RoastCard.astro        # The roast
    ShareCard.astro        # Social share card + PNG download
    ResultsDashboard.astro # Composes the full results experience
    AdSlot.astro           # Reserved AdSense placeholders (no CLS)
    Disclaimer.astro / SiteHeader.astro / SiteFooter.astro
  layouts/Layout.astro     # <head>, SEO/OG meta, mesh backdrop
  pages/index.astro        # Page + client-side controller script
  styles/global.css        # Design tokens + component primitives
```

## How scoring works

The score is a weighted blend (savings & debt dominate; income alone never
guarantees a high score):

| Factor                   | Weight |
| ------------------------ | ------ |
| Savings-to-income ratio  | 35%    |
| Debt-to-income ratio     | 25%    |
| Age-adjusted progress    | 25%    |
| Net savings (savings−debt) | 15%  |

### Updating the benchmarks

All benchmark numbers live in [`src/data/benchmarks.json`](src/data/benchmarks.json).
The values are **realistic placeholders** calibrated to public Survey of
Consumer Finances (SCF) style ranges, not exact published figures. The file's
`_meta.howToUpdate` block documents exactly how to refresh them:

- `netWorthPercentilesByAge` → per-age percentile breakpoints for liquid +
  invested assets net of debt (used for the percentile).
- `savingsMultipleTargets` → Fidelity-style "save N× income by age" guideposts
  (used for financial age + age-adjusted progress).
- `scoring.weights` / `scoring.curves` → tune the score behavior.

## Monetization (AdSense-ready)

Clean, non-intrusive `<AdSlot>` placeholders reserve layout space (preventing
CLS) in three spots: below the hero, the results sidebar (desktop), and between
the results and the share card. Wire up AdSense by adding the publisher script
in `Layout.astro` and replacing each placeholder's inner markup.

## Commands

| Command           | Action                          |
| ----------------- | ------------------------------- |
| `npm run dev`     | Start the dev server            |
| `npm run build`   | Build the static site to `dist/`|
| `npm run preview` | Preview the production build     |
