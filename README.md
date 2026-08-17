# Cooked Finance

Cooked Finance is a private, client-side financial health check and educational
calculator library for cookedfinance.com.

The homepage turns seven estimates into a 0–100 educational Cooked Score, four
published pillars, supportive strengths, three ranked next moves, and an
interactive 12-month scenario. It is not a credit score, peer percentile,
forecast, or financial plan.

## Current product

- Seven-input financial health check
- Four-factor methodology with published weights and curves
- Net worth, debt-to-income, emergency-fund, and savings-rate calculators
- Evidence-linked methodology, score-range, benchmark, and guide pages
- Editorial, source, corrections, privacy, and advertising policies
- Optional local result saving; nothing is saved automatically
- Consent-based analytics with no financial input or result parameters
- No accounts, database, bank connection, ads, AdSense code, or ad placeholders

## Scoring model

| Pillar | Weight |
| --- | ---: |
| Cash buffer | 30% |
| Monthly debt-payment burden | 25% |
| Savings habit | 20% |
| Long-term retirement progress | 25% |

The source of truth is [benchmarks.json](src/data/benchmarks.json).
Implementation lives in [scoring.ts](src/lib/scoring.ts), and the readable
explanation lives in [methodology.astro](src/pages/methodology.astro).

## Privacy and monetization

Calculator values are processed in the browser and are not placed in URLs or
analytics events. A visitor can explicitly save one check to browser local
storage and delete it from the interface.

Cooked Finance has not applied for AdSense and currently displays no paid
advertising. Advertising should not be integrated until the content library and
traffic are mature; the current planning checkpoint is stable traffic around
100–200 daily visitors. See
[advertising-policy.astro](src/pages/advertising-policy.astro).

## Commands

| Command | Action |
| --- | --- |
| npm run dev | Start Astro locally |
| npm run build | Build static output to dist |
| npm run verify | Build the site and run scoring regression assertions |
| npm run preview | Preview the built Cloudflare Worker assets |

Production hosting uses the Worker in [worker/index.js](worker/index.js) and
[wrangler.jsonc](wrangler.jsonc). It serves the static Astro build, sends HTTP
and `www` traffic to the HTTPS apex domain, normalizes page URLs to trailing
slashes, and applies baseline security headers. Run `npx wrangler deploy
--dry-run` before an intentional production deployment.

The sitemap is generated from page files by
[sitemap.xml.ts](src/pages/sitemap.xml.ts). The production origin is configured
in [astro.config.mjs](astro.config.mjs).
