import { site } from '../config/site.ts';
import type { ArticleData, ProjectData } from '../schemas/content.ts';

export function escapeXml(value: string | number | boolean): string {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

export function cdata(value: string): string {
  return `<![CDATA[${value.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
}

export function rssResponse(xml: string): Response {
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}

export function rssDocument(channel: string, namespaces = ''): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"${namespaces}>\n<channel>\n${channel}\n</channel>\n</rss>\n`;
}

type SiteArticle = Pick<ArticleData, 'title' | 'slug' | 'description' | 'publishedAt' | 'tags'>;
type SiteProject = Pick<ProjectData, 'title' | 'slug' | 'description' | 'publishedAt'>;

export function serializeSiteFeed(articles: SiteArticle[], projects: SiteProject[]): string {
  const items = [
    ...articles.map((item) => ({ ...item, link: `${site.url}/stash/${item.slug}/`, categories: item.tags })),
    ...projects.map((item) => ({ ...item, link: `${site.url}/projects/${item.slug}/`, categories: ['Projects'] })),
  ].sort((a, b) => b.publishedAt.valueOf() - a.publishedAt.valueOf() || a.link.localeCompare(b.link));

  const itemXml = items.map((item) => `<item>
<title>${escapeXml(item.title)}</title>
<link>${escapeXml(item.link)}</link>
<guid isPermaLink="true">${escapeXml(item.link)}</guid>
<description>${escapeXml(item.description)}</description>
<pubDate>${item.publishedAt.toUTCString()}</pubDate>
${item.categories.map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n')}
</item>`).join('\n');

  return rssDocument(`<title>${site.name}</title>
<link>${site.url}/</link>
<description>${escapeXml(site.description)}</description>
<language>en-AU</language>
<atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml" />
${itemXml}`, ' xmlns:atom="http://www.w3.org/2005/Atom"');
}

