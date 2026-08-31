import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const outputDirectory = 'dist';
const failures = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

function countMatches(value, expression) {
  return [...value.matchAll(expression)].length;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const files = await walk(outputDirectory);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const expectedSystemSlugs = [
  'refrigerator',
  'freezer',
  'clothes-washer',
  'electric-dryer',
  'dishwasher',
  'electric-water-heater',
  'room-air-conditioner',
  'dehumidifier',
];

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const relative = file.slice(outputDirectory.length).replaceAll('\\', '/');
  const h1Count = countMatches(html, /<h1\b/gi);
  if (h1Count !== 1) failures.push(`${relative}: expected one h1, found ${h1Count}`);
  if (!/<meta name="description" content="[^"]+"/i.test(html)) {
    failures.push(`${relative}: missing meta description`);
  }
  if (!/<link rel="canonical" href="https:\/\/cookedfinance\.com\/[^"]*"/i.test(html)) {
    failures.push(`${relative}: missing absolute canonical`);
  }
  if (!/<meta property="og:image" content="https:\/\/cookedfinance\.com\/og\.png"/i.test(html)) {
    failures.push(`${relative}: social image is not the PNG asset`);
  }

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      failures.push(`${relative}: invalid JSON-LD (${error.message})`);
    }
  }

  for (const match of html.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/gi)) {
    const href = match[1];
    if (href === '/' || /\.[a-z0-9]+$/i.test(href)) continue;
    if (!href.endsWith('/')) {
      failures.push(`${relative}: slashless internal page link ${href}`);
      continue;
    }
    const target = join(outputDirectory, href.slice(1), 'index.html');
    if (!await exists(target)) failures.push(`${relative}: broken internal link ${href}`);
  }
}

const homepage = await readFile(join(outputDirectory, 'index.html'), 'utf8');
if (!homepage.includes('Know what your home costs before it surprises you.')) {
  failures.push('/index.html: missing the new home-cost product promise');
}

const myHome = await readFile(join(outputDirectory, 'my-home', 'index.html'), 'utf8');
if (!/<meta name="robots" content="noindex(?:,|\s)/i.test(myHome)) {
  failures.push('/my-home/index.html: private workspace must remain noindex');
}

for (const slug of expectedSystemSlugs) {
  if (!await exists(join(outputDirectory, 'systems', slug, 'index.html'))) {
    failures.push(`/systems/${slug}/: expected system guide was not built`);
  }
}

const sitemap = await readFile(join(outputDirectory, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/g)];
if (sitemapUrls.length === 0) failures.push('/sitemap.xml: no complete URL records found');
if (sitemap.includes('[slug]')) failures.push('/sitemap.xml: contains an unresolved dynamic route');
if (sitemap.includes('/my-home/')) failures.push('/sitemap.xml: contains the private My Home route');
for (const slug of expectedSystemSlugs) {
  if (!sitemap.includes(`https://cookedfinance.com/systems/${slug}/`)) {
    failures.push(`/sitemap.xml: missing /systems/${slug}/`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Cooked Finance site verification passed (${htmlFiles.length} HTML pages).`);
}
