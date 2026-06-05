/**
 * seo.ts — Centralized SEO constants and JSON-LD structured data builders.
 *
 * Keeps meta content and schema.org markup in one place so the Layout stays
 * clean and the FAQ content + FAQPage schema never drift apart.
 */

export const SITE = {
  name: 'Cooked Finance',
  domain: 'cookedfinance.com',
  url: 'https://cookedfinance.com',
  defaultTitle:
    'Are You Financially Cooked? | Free Financial Health Score Calculator',
  defaultDescription:
    'Calculate your Financial Cooked Score, Financial Age, and see how you compare to Americans your age. Free financial health assessment in under 60 seconds.',
  ogImage: 'https://cookedfinance.com/og.svg',
  twitterImage: 'https://cookedfinance.com/og.svg',
  locale: 'en_US',
  twitterHandle: '@cookedfinance',
  keywords: [
    'financial health score',
    'financial score calculator',
    'financial health calculator',
    'money health check',
    'personal finance score',
    'financial wellness score',
    'financial fitness calculator',
    'net worth score',
    'financial age calculator',
    'retirement readiness score',
    'how financially cooked am i',
    'financial health assessment',
    'personal finance calculator',
    'money score calculator',
    'financial checkup',
    'financial benchmark calculator',
    'compare finances by age',
    'financial percentile calculator',
    'financial wellness assessment',
    'financial score by age',
    'financial planning calculator',
  ],
} as const;

/** Frequently asked questions. Rendered visibly AND emitted as FAQPage JSON-LD. */
export interface FaqItem {
  q: string;
  /** Answer as plain text (also used for schema). */
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'What is a Financial Health Score?',
    a: 'A financial health score is a single number that summarizes how strong your overall money situation is by looking at factors like savings, debt, income and net worth together. Instead of staring at separate account balances, you get one easy benchmark you can track over time and compare against other people.',
  },
  {
    q: 'How is the Financial Cooked Score calculated?',
    a: 'The Financial Cooked Score is a 0–100 score built from four factors: your savings-to-income ratio, your debt-to-income ratio, your net savings (savings minus debt) and your age-adjusted progress toward typical savings milestones. Savings and debt carry the most weight, so a high income alone will not guarantee a high score.',
  },
  {
    q: 'What is Financial Age?',
    a: 'Financial Age estimates the age your finances "look like" based on how your savings compare to common age-based savings targets. If you have saved more than is typical for your age, your financial age is younger than your real age; if you are behind, it is older.',
  },
  {
    q: 'How accurate is the score?',
    a: 'The score is a directional estimate built on public, Survey of Consumer Finances–style benchmarks, not a precise audit of your finances. It is designed to be realistic and motivating rather than exact, and it is meant for entertainment and education only.',
  },
  {
    q: 'How do I improve my score?',
    a: 'The fastest levers are increasing savings and reducing high-interest debt. Building an emergency fund, automating monthly contributions, and paying down balances all push your savings-to-income and debt-to-income ratios in the right direction, which raises your score over time.',
  },
  {
    q: 'Is this financial advice?',
    a: 'No. Cooked Finance is for entertainment and educational purposes only and is not financial advice. For decisions about your specific situation, talk to a qualified financial professional.',
  },
  {
    q: 'What is considered a good Financial Health Score?',
    a: 'On our 0–100 scale, anything 61 and above is "Financially Stable" or better, which signals solid savings and manageable debt for your age. Scores of 81–100 ("Cooking Successfully") indicate you are well ahead of typical benchmarks.',
  },
  {
    q: 'What is the average Financial Health Score in the United States?',
    a: 'Most people land in the middle of the scale. A typical American profile tends to fall in the 41–60 "Medium Rare" range, where savings are growing but debt and thin emergency funds still hold the score back.',
  },
  {
    q: 'How does debt affect my Financial Cooked Score?',
    a: 'Debt is the second-heaviest factor. A high debt-to-income ratio lowers your score significantly, and when total debt exceeds your savings your net worth turns negative, which drags the score down further. Reducing debt is one of the most effective ways to climb.',
  },
  {
    q: 'How do savings impact my financial health?',
    a: 'Savings are the single biggest factor. A larger savings-to-income ratio raises your score the most because it reflects both an emergency cushion and long-term security. Even small, consistent contributions compound into a meaningfully higher score.',
  },
  {
    q: 'Can a high income improve my score?',
    a: 'Income helps, but only indirectly. It makes a given amount of debt more manageable, yet income on its own never guarantees a high score. Someone who earns a lot but saves little will still score lower than a modest earner with strong savings.',
  },
  {
    q: 'Why is my Financial Age different from my real age?',
    a: 'Financial Age reflects your savings progress, not the calendar. Saving more than typical for your age makes your financial age younger; falling behind on savings or carrying heavy debt makes it older.',
  },
  {
    q: 'How often should I check my Financial Health Score?',
    a: 'Checking every few months, or after a major change like a raise, a new loan or a big savings milestone, is plenty. The score is most useful as a trend you watch over time rather than a daily number.',
  },
  {
    q: 'What is a healthy savings-to-income ratio?',
    a: 'It depends on age, but a common rule of thumb is to have roughly one times your annual income saved by 30, three times by 40, and six times by 50. The higher your savings relative to income, the stronger your financial health.',
  },
  {
    q: 'What is a healthy debt-to-income ratio?',
    a: 'Lower is better. A debt-to-income ratio under about 0.35 (35%) is generally considered healthy, while ratios above 1.0 — owing more than a year of income — start to weigh heavily on your financial health.',
  },
  {
    q: 'How is my percentile ranking calculated?',
    a: 'Your percentile compares your net worth (savings minus debt) to age-based benchmarks inspired by the Federal Reserve Survey of Consumer Finances. It estimates the share of Americans your age you are financially ahead of.',
  },
  {
    q: 'How do I compare to other Americans my age?',
    a: 'The results show a percentile such as "ahead of 68% of Americans your age," based on age-adjusted net worth benchmarks. It is a quick way to see where you stand relative to your peers.',
  },
  {
    q: 'Does net worth affect my score?',
    a: 'Yes. Net worth — your savings and investments minus total debt — is one of the four scoring factors and also drives your percentile. Positive and growing net worth lifts both your score and your ranking.',
  },
  {
    q: 'What are the biggest factors that improve financial health?',
    a: 'In order of impact: building savings, lowering debt, growing positive net worth, and staying on track with age-based savings targets. Focusing on savings and debt first moves the score the most.',
  },
  {
    q: 'Can I improve my Financial Cooked Score over time?',
    a: 'Absolutely. The score is designed to reward steady progress. As you save more, pay down debt and grow your net worth, your score, percentile and financial age all improve.',
  },
  {
    q: 'What should my emergency fund be?',
    a: 'A common target is three to six months of essential expenses kept in accessible savings. Even a starter fund of one month makes a real difference and noticeably improves your savings-to-income ratio.',
  },
  {
    q: 'How much savings should I have for my age?',
    a: 'Age-based guideposts suggest about 1× your income saved by 30, 2–3× by 40, 4–6× by 50, and roughly 8–10× by retirement age. These are rules of thumb, and any progress toward them strengthens your score.',
  },
  {
    q: 'What do Financial Apocalypse, Deep Fried, Medium Rare, Financially Stable and Cooking Successfully mean?',
    a: 'They are the five status levels on the 0–100 scale: Financial Apocalypse (0–20) signals serious strain; Deep Fried (21–40) means you are behind; Medium Rare (41–60) is roughly average; Financially Stable (61–80) reflects solid footing; and Cooking Successfully (81–100) means you are well ahead of typical benchmarks.',
  },
];

/**
 * Build the combined JSON-LD graph: WebSite, WebApplication, and FAQPage.
 * Returned as a string ready to drop inside a <script type="application/ld+json">.
 */
export function buildStructuredData(): string {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE.url}/#website`,
        url: `${SITE.url}/`,
        name: SITE.name,
        description: SITE.defaultDescription,
        inLanguage: 'en-US',
        publisher: { '@id': `${SITE.url}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE.url}/#organization`,
        name: SITE.name,
        url: `${SITE.url}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE.url}/favicon.svg`,
        },
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE.url}/#app`,
        name: 'Financial Health Score Calculator',
        url: `${SITE.url}/`,
        description: SITE.defaultDescription,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any (web browser)',
        browserRequirements: 'Requires JavaScript.',
        isAccessibleForFree: true,
        inLanguage: 'en-US',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        publisher: { '@id': `${SITE.url}/#organization` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE.url}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
    ],
  };

  return JSON.stringify(graph);
}
