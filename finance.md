# Cooked Finance — current product brief

This file supersedes the original MVP prompt. It exists to prevent older
requirements from reintroducing fabricated comparisons, automatic storage, or
premature advertising.

## Product promise

Cooked Finance is a private, educational financial health check for U.S.
visitors. Seven estimates produce a 0–100 Cooked Score, four transparent pillar
scores, plain-language context, ranked next moves, and an illustrative 12-month
scenario. It is not a credit score, peer percentile, financial age, forecast,
or individualized financial advice.

## Assessment inputs

- Age
- Gross annual income
- Essential monthly spending, including required debt minimums
- Liquid savings
- Required monthly debt payments
- Retirement and investment balances
- Amount saved or invested each month

For pension assets, include only a vested account value or stated cash-balance
value. Do not include projected defined-benefit income.

## Scoring contract

The source of truth is `src/data/benchmarks.json`; the implementation is
`src/lib/scoring.ts`; and the public explanation is `src/pages/methodology.astro`.
The four weighted pillars are cash buffer (30%), monthly debt-payment burden
(25%), savings habit (20%), and long-term retirement progress (25%). Status
ranges must remain synchronized with `src/lib/scoring.ts` and
`src/pages/score-ranges.astro`.

Do not add an unsupported percentile, “financial age,” net-worth-based main
score, or benchmark claim. Material methodology changes require a version bump,
verification cases, and matching public documentation.

## Privacy contract

All calculator values are processed in the browser. Financial inputs and
results must never be placed in URLs or analytics events. Nothing is saved
automatically. A visitor may explicitly save one check in local storage and can
delete it from the same interface. Analytics stays off until the visitor opts
in, and withdrawing consent must take effect immediately.

## Content and trust

Every financial claim should be specific, qualified, and linked to an official
or primary source when practical. Pages must distinguish educational
guideposts from rules or guarantees. Never invent authors, credentials,
statistics, reviews, traffic, or testimonials. Keep methodology, editorial,
source, corrections, privacy, terms, contact, and advertising policies easy to
find.

## Monetization boundary

Cooked Finance has not applied for AdSense and currently has no ads, ad code,
`ads.txt`, or ad placeholders. Do not add them yet. The owner’s planning
checkpoint is a mature content library and stable traffic around 100–200 daily
visitors; this is an internal readiness threshold, not a Google requirement.
Only after an explicit later decision should real publisher verification,
advertising consent, privacy disclosures, and carefully tested placements be
added.

## Technical priorities

- Astro, TypeScript, and Tailwind CSS v4
- Static-first, client-side calculators, no accounts or financial-data backend
- Accessible keyboard and screen-reader behavior
- Canonical HTTPS apex URLs with trailing slashes
- Fast mobile performance and resilient no-JavaScript privacy defaults
- Production changes verified by build, scoring tests, link checks, and browser QA
