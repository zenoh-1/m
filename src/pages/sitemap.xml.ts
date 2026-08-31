/**
 * sitemap.xml — Single, conventional sitemap served at /sitemap.xml.
 *
 * Routes are derived from the .astro files in src/pages so the sitemap stays
 * in sync as pages are added or removed (no manual list to maintain). Error
 * pages (404/500) and non-page endpoints are excluded. In Astro's static
 * build this endpoint is prerendered to dist/sitemap.xml.
 */
import type { APIRoute } from 'astro';
import { SITE } from '../lib/seo';
import { HOME_SYSTEMS } from '../data/homeSystems';

// Eagerly collect every page component under src/pages.
const pageModules = import.meta.glob('./**/*.astro', { eager: true });

// Routes that should never appear in the sitemap.
const EXCLUDED = new Set(['404', '500', 'my-home']);

/** Convert a glob key like "./about.astro" into a canonical path like "/about/". */
function toRoute(filePath: string): string | null {
  if (filePath.includes('[')) return null;
  const slug = filePath
    .replace(/^\.\//, '') // drop leading "./"
    .replace(/\.astro$/, '') // drop extension
    .replace(/(^|\/)index$/, ''); // treat index files as their directory root

  const lastSegment = slug.split('/').pop() ?? slug;
  if (EXCLUDED.has(slug) || EXCLUDED.has(lastSegment)) return null;

  // Trailing slash matches Astro's default page output (e.g. /about/).
  return slug === '' ? '/' : `/${slug}/`;
}

const systemRoutes = HOME_SYSTEMS.map((system) => `/systems/${system.slug}/`);
const routes = [...new Set([...Object.keys(pageModules).map(toRoute), ...systemRoutes])]
  .filter((route): route is string => route !== null)
  .sort();

function lastModified(route: string): string {
  const system = HOME_SYSTEMS.find((candidate) => route === `/systems/${candidate.slug}/`);
  if (system) return system.reviewedAt;
  const legacyFinance = route.startsWith('/calculators/')
    || route.startsWith('/guides/')
    || route.startsWith('/benchmarks/')
    || route.startsWith('/financial-health-score/')
    || route.startsWith('/score-ranges/')
    || route.startsWith('/money-tools/financial-health-check/');
  return legacyFinance ? '2026-08-17' : '2026-08-31';
}

export const GET: APIRoute = () => {
  const urls = routes
    .map((route) => `<url><loc>${SITE.url}${route}</loc><lastmod>${lastModified(route)}</lastmod></url>`)
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
