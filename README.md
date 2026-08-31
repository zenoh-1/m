# Cooked Finance

Cooked Finance is a U.S.-first home-cost intelligence site for
`cookedfinance.com`. It helps people calculate appliance running costs, compare
repair and replacement scenarios, and keep a private local maintenance plan.

The original financial-health check and four money calculators remain available
under Money Tools, but they are no longer the homepage or primary growth model.

## Current product

- Eight source-backed appliance and system guides
- Electricity and optional natural-gas cost calculator
- Transparent repair-versus-replace scenario tool
- Local-only My Home plan with JSON and calendar export
- Public home-cost and legacy financial methodologies
- Editorial, source, corrections, privacy, advertising, and safety boundaries
- Static Astro pages with client-side tools and no account requirement
- Consent-based analytics with no calculator values or home-plan records
- No paid advertising, AdSense code, or ad placeholders

## Primary architecture

| Area | Source |
| --- | --- |
| Home system records | `src/data/homeSystems.ts` |
| Home cost calculations | `src/lib/home-cost.ts` |
| System page template | `src/pages/systems/[slug].astro` |
| Local home plan | `src/components/home/MyHomeManager.astro` |
| Shared metadata | `src/lib/seo.ts` |
| Canonical/security Worker | `worker/index.js` |

Every indexable system page must contain a distinct input definition, care
plan, safety boundary, source panel, and useful connection to a calculator.
User-specific results and My Home remain out of the sitemap.

## Privacy

Calculations happen in the browser. My Home records are saved only after an
explicit action under `cooked-finance-home-plan-v1` in browser local storage.
No account, database, utility connection, or model-number upload is required.

## Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Start Astro locally |
| `npm run build` | Build static output to `dist` |
| `npm run verify:home` | Run home-cost engine regression checks |
| `npm run verify:score` | Run legacy financial-score regression checks |
| `npm run verify:site` | Verify generated metadata, links, and JSON-LD |
| `npm run verify` | Build and run every verification suite |
| `npm run preview` | Preview the built Cloudflare Worker assets |

Production remains on the existing Cloudflare Worker configuration in
`worker/index.js` and `wrangler.jsonc`. Deployment is intentionally separate
from ordinary local verification.

See `PRODUCT.md` for the active product contract, `DESIGN.md` for interface
rules, and `docs/legacy-finance-product.md` for the archived score brief.
