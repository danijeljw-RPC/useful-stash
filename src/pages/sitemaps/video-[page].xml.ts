import { getVideoSitemapEntries } from '../../utils/sitemap-content';
import { paginateSitemap, serializeVideoSitemap, xmlResponse } from '../../utils/sitemap';
export const prerender = true;
export async function getStaticPaths() { return paginateSitemap(await getVideoSitemapEntries()).map((entries, index) => ({ params: { page: String(index + 1) }, props: { entries } })); }
export function GET({ props }: { props: { entries: Awaited<ReturnType<typeof getVideoSitemapEntries>> } }) { return xmlResponse(serializeVideoSitemap(props.entries)); }
