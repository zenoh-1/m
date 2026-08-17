/** Shared site metadata and the small set of homepage FAQs. */
export const SITE = {
  name: 'Cooked Finance',
  url: 'https://cookedfinance.com',
  locale: 'en_US',
  defaultTitle: 'Free Financial Health Check & Score Calculator | Cooked Finance',
  defaultDescription:
    'Get a private, educational financial health estimate based on your cash buffer, debt-payment burden, savings habit, and long-term progress.',
  ogImage: 'https://cookedfinance.com/og.png',
  twitterImage: 'https://cookedfinance.com/og.png',
} as const;

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Is the Cooked Score a credit score?',
    a: 'No. It is an educational estimate created by Cooked Finance. It does not use your credit report and lenders do not use it.',
  },
  {
    q: 'Do my financial numbers leave my device?',
    a: 'The calculator runs in your browser. Your entered financial values are not sent to Cooked Finance, Google Analytics, or advertising services.',
  },
  {
    q: 'What does the score measure?',
    a: 'It combines four transparent signals: emergency cash runway, monthly debt-payment burden, current savings habit, and long-term retirement progress.',
  },
  {
    q: 'How accurate does my information need to be?',
    a: 'Reasonable estimates are enough for a directional check. Use one adult’s personal figures throughout and run a separate check for a partner.',
  },
  {
    q: 'How often should I run the check?',
    a: 'Quarterly, or after a meaningful change such as paying off a loan, changing income, or building a larger cash buffer.',
  },
  {
    q: 'Is this financial advice?',
    a: 'No. Cooked Finance provides general educational information, not individualized financial, tax, investment, or legal advice.',
  },
];

/** Site-level structured data. Page-specific markup can be supplied separately. */
export function buildStructuredData(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
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
        '@type': 'WebSite',
        '@id': `${SITE.url}/#website`,
        url: `${SITE.url}/`,
        name: SITE.name,
        description: SITE.defaultDescription,
        inLanguage: 'en-US',
        publisher: { '@id': `${SITE.url}/#organization` },
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE.url}/#financial-health-check`,
        name: 'Cooked Finance Financial Health Check',
        url: `${SITE.url}/`,
        description: SITE.defaultDescription,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any web browser',
        isAccessibleForFree: true,
        inLanguage: 'en-US',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        publisher: { '@id': `${SITE.url}/#organization` },
      },
    ],
  });
}
