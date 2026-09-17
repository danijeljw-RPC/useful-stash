import { escapeXml } from './feed-xml.ts';

export const SITEMAP_PAGE_SIZE = 10_000;
export type SitemapUrl = { loc: string; lastmod?: Date };
export type VideoSitemapUrl = SitemapUrl & {
  title: string; description: string; thumbnail: string; content: string; publishedAt: Date; duration?: number;
};

function assertHttps(value: string): void {
  let url: URL;
  try { url = new URL(value); } catch { throw new TypeError('Sitemap URLs must be absolute HTTPS URLs.'); }
  if (url.protocol !== 'https:') throw new TypeError('Sitemap URLs must use HTTPS.');
}

export function paginateSitemap<T>(entries: T[], size = SITEMAP_PAGE_SIZE): T[][] {
  if (!Number.isInteger(size) || size < 1 || size > SITEMAP_PAGE_SIZE) throw new RangeError('Invalid sitemap page size.');
  const pages: T[][] = [];
  for (let index = 0; index < entries.length; index += size) pages.push(entries.slice(index, index + size));
  return pages.length ? pages : [[]];
}

export function serializeSitemapIndex(urls: string[]): string {
  const unique = [...new Set(urls)];
  unique.forEach(assertHttps);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map((loc) => `<sitemap><loc>${escapeXml(loc)}</loc></sitemap>`).join('\n')}\n</sitemapindex>\n`;
}

export function serializeUrlSitemap(entries: SitemapUrl[]): string {
  entries.forEach(({ loc }) => assertHttps(loc));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(({ loc, lastmod }) => `<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`;
}

export function serializeVideoSitemap(entries: VideoSitemapUrl[]): string {
  entries.forEach(({ loc, thumbnail, content }) => { assertHttps(loc); assertHttps(thumbnail); assertHttps(content); });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${entries.map((entry) => `<url><loc>${escapeXml(entry.loc)}</loc><lastmod>${entry.lastmod?.toISOString().slice(0, 10) ?? entry.publishedAt.toISOString().slice(0, 10)}</lastmod><video:video><video:thumbnail_loc>${escapeXml(entry.thumbnail)}</video:thumbnail_loc><video:title>${escapeXml(entry.title)}</video:title><video:description>${escapeXml(entry.description)}</video:description><video:content_loc>${escapeXml(entry.content)}</video:content_loc><video:publication_date>${entry.publishedAt.toISOString()}</video:publication_date>${entry.duration ? `<video:duration>${entry.duration}</video:duration>` : ''}</video:video></url>`).join('\n')}\n</urlset>\n`;
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
