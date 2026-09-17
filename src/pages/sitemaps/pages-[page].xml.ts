import { getPageSitemapEntries } from '../../utils/sitemap-content';
import { paginateSitemap, serializeUrlSitemap, xmlResponse } from '../../utils/sitemap';
export const prerender = true;
export async function getStaticPaths() { return paginateSitemap(await getPageSitemapEntries()).map((entries, index) => ({ params: { page: String(index + 1) }, props: { entries } })); }
export function GET({ props }: { props: { entries: Awaited<ReturnType<typeof getPageSitemapEntries>> } }) { return xmlResponse(serializeUrlSitemap(props.entries)); }
