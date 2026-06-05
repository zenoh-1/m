I have initialized a new Astro.js project.

Use Astro Docs MCP, Tailwind 4 Docs MCP, and web-design-guidelines skills for creating the website. Also use @DESIGN.md file as the primary design reference and keep the website design heavily inspired by Vercel (clean, minimal, premium, dark-first, mobile-first, excellent typography, smooth animations, fast performance).

# Product

**Domain:** cookedfinance.com

**Title:** Are You Financially Cooked?

**Tagline:** Find out how financially cooked you really are in under 60 seconds.

Build a fun but credible financial health scoring tool.

**MVP FIRST.**

# Important Constraints

Do not build:

* Authentication
* Databases
* APIs
* User accounts
* Payments
* Admin dashboards
* Future features

Focus entirely on a polished Quick Check experience that can be completed in under 30 seconds.

# Homepage

* Hero section with headline: **"Are You Financially Cooked?"**
* Tagline
* Primary CTA: **"Check My Score"**
* Show example metrics below hero:

  * Cooked Score: 73/100
  * Ahead of 68% of Americans
  * Financial Age: 41

# Assessment Form

Collect only these 4 inputs:

* Age (18–70)
* Annual Income ($)
* Savings + Investments ($)
* Total Debt ($)

# Results Experience

Instantly display:

* Large animated Financial Cooked Score (0–100) with gauge
* Status Badge with emoji
* Overall Percentile ("You are ahead of X% of Americans your age")
* Financial Age
* Personalized Financial Roast
* Strengths & Areas To Improve (short lists)
* Downloadable Share Card

# Status Levels

**0–20 → Financial Apocalypse ☠️**

**21–40 → Deep Fried 🍗**

**41–60 → Medium Rare 🥩**

**61–80 → Financially Stable 📈**

**81–100 → Cooking Successfully 🚀**

# Disclaimer

Visible on all pages:

"For entertainment and educational purposes only. Not financial advice."

# Monetization (AdSense Ready)

Reserve clean, non-intrusive placeholders for Google AdSense from day one:

* One placeholder below the hero on homepage
* One sidebar placeholder on results page (desktop)
* One placeholder after the results and before the share card

Make sure ad placements do not hurt user experience or loading speed.

# Scoring & Data

Use realistic US benchmarks inspired by Federal Reserve Survey of Consumer Finances.

Store benchmark data in:

`src/data/benchmarks.json`

If exact benchmark data is unavailable, use realistic placeholder values and clearly document where benchmark values can be updated later.

Scoring priority:

1. Savings-to-income ratio
2. Debt-to-income ratio
3. Net savings (Savings − Debt)
4. Age-adjusted financial progress

Savings and debt should have the biggest impact.

Income alone should not guarantee a high score.

Generate:

* Financial Cooked Score
* Overall Percentile
* Financial Age

# Financial Roast Engine

No AI APIs.

Create a rule-based system in:

`src/lib/roasts.ts`

Use 30–40 roast templates.

Examples:

* "Your savings account appears to be practicing minimalism."
* "Your debt is putting in overtime."
* "Unexpectedly responsible. Suspicious."

Roasts must be:

* Funny
* Lighthearted
* Family-friendly
* Shareable

# Share Card

Create a visually strong social share card containing:

* Cooked Score
* Percentile
* Financial Age
* Roast

Include a **Download Image** button.

Optimize the share card for:

* X
* Reddit
* LinkedIn
* Discord

# Technical Requirements

* Astro
* Tailwind CSS v4
* TypeScript
* Fully client-side

Logic:

* `src/lib/scoring.ts`
* `src/lib/roasts.ts`

Benchmarks:

* `src/data/benchmarks.json`

Use localStorage to save the most recent result.

Target:

* Lighthouse 95+
* Fully responsive
* Excellent UX
* Fast loading

# Components to Create

* Hero
* AssessmentForm
* ScoreGauge
* RoastCard
* ShareCard
* ResultsDashboard

# Generate

* `src/pages/index.astro` (main page with form + client-side results)
* `src/lib/scoring.ts`
* `src/lib/roasts.ts`
* `src/data/benchmarks.json`
* All required components listed above

# Implementation Instructions

Do not output everything at once.

First generate the project structure and core files:

* benchmarks.json
* scoring.ts
* roasts.ts

Then create the components one by one.

Keep code modular, readable, and production-ready.

# Priorities

When making decisions, prioritize:

1. Simplicity
2. Speed & Performance
3. User Delight
4. Shareability

over feature completeness.

Deliver a polished, small, high-quality product.
