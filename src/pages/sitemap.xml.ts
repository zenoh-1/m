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

// Eagerly collect every page component under src/pages.
const pageModules = import.meta.glob('./**/*.astro', { eager: true });

// Routes that should never appear in the sitemap.
const EXCLUDED = new Set(['404', '500']);

/** Convert a glob key like "./about.astro" into a canonical path like "/about/". */
function toRoute(filePath: string): string | null {
  const slug = filePath
    .replace(/^\.\//, '') // drop leading "./"
    .replace(/\.astro$/, '') // drop extension
    .replace(/(^|\/)index$/, ''); // treat index files as their directory root

  const lastSegment = slug.split('/').pop() ?? slug;
  if (EXCLUDED.has(slug) || EXCLUDED.has(lastSegment)) return null;

  // Trailing slash matches Astro's default page output (e.g. /about/).
  return slug === '' ? '/' : `/${slug}/`;
}

const routes = [...new Set(Object.keys(pageModules).map(toRoute))]
  .filter((route): route is string => route !== null)
  .sort();

export const GET: APIRoute = () => {
  const urls = routes
    .map((route) => `<url><loc>${SITE.url}${route}</loc></url>`)
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
