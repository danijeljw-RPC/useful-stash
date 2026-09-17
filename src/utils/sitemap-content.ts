import { getCollection } from 'astro:content';
import { site } from '../config/site';
import { isArticleVisible, sortArticles, sortProjects } from './content';
import type { SitemapUrl, VideoSitemapUrl } from './sitemap';

export async function getPageSitemapEntries(): Promise<SitemapUrl[]> {
  const [articles, authors] = await Promise.all([getCollection('articles'), getCollection('authors')]);
  const fixed = ['/', '/about/', '/stash/', '/authors/', '/contact/', '/contact/media/', '/contact/be-a-guest/', '/contact/share/'];
  return [
    ...fixed.map((path) => ({ loc: new URL(path, site.url).href })),
    ...authors.filter(({ data }) => !data.seo.noindex).map(({ data }) => ({ loc: new URL(`/authors/${data.slug}/`, site.url).href })),
    ...sortArticles(articles).filter(({ data }) => isArticleVisible(data, true)).map(({ data }) => ({ loc: new URL(`/stash/${data.slug}/`, site.url).href, lastmod: data.updatedAt ?? data.publishedAt })),
  ].sort((a, b) => a.loc.localeCompare(b.loc));
}

export async function getProjectSitemapEntries(): Promise<SitemapUrl[]> {
  const projects = sortProjects(await getCollection('projects')).filter(({ data }) => !data.draft);
  return [
    { loc: new URL('/projects/', site.url).href },
    ...projects.map(({ data }) => ({ loc: new URL(`/projects/${data.slug}/`, site.url).href, lastmod: data.lastUpdated })),
  ];
}

export async function getVideoSitemapEntries(): Promise<VideoSitemapUrl[]> {
  return sortArticles(await getCollection('articles'))
    .filter(({ data }) => isArticleVisible(data, true) && Boolean(data.video?.hosted) && Boolean(data.heroImage))
    .map(({ data }) => ({
      loc: new URL(`/stash/${data.slug}/watch/`, site.url).href,
      lastmod: data.updatedAt ?? data.publishedAt,
      title: data.title,
      description: data.description,
      thumbnail: new URL(data.heroImage!, site.url).href,
      content: data.video!.hosted!,
      publishedAt: data.publishedAt,
    }));
}
