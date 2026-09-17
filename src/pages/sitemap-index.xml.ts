import { site } from '../config/site';
import { getPageSitemapEntries, getProjectSitemapEntries, getVideoSitemapEntries } from '../utils/sitemap-content';
import { paginateSitemap, serializeSitemapIndex, xmlResponse } from '../utils/sitemap';

export const prerender = true;
export async function GET() {
  const families = await Promise.all([getPageSitemapEntries(), getProjectSitemapEntries(), getVideoSitemapEntries()]);
  const names = ['pages', 'projects', 'video'];
  const urls = families.flatMap((entries, familyIndex) => paginateSitemap(entries).map((_, index) => new URL(`/sitemaps/${names[familyIndex]}-${index + 1}.xml`, site.url).href));
  return xmlResponse(serializeSitemapIndex(urls));
}
