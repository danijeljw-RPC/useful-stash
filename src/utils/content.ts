import type { ArticleData, ProjectData } from '../schemas/content.ts';

type ArticleLike = { id?: string; data: ArticleData };
type ProjectLike = { id?: string; data: ProjectData };

export function isProductionBuild(): boolean {
  return import.meta.env?.PROD ?? process.env.NODE_ENV === 'production';
}

export function isArticleVisible(data: ArticleData, production = isProductionBuild()): boolean {
  if (data.seo.noindex) return false;
  return !(production && (data.draft || data.fixture));
}

export function isArticleRoutable(data: ArticleData, production = isProductionBuild()): boolean {
  return !(production && (data.draft || data.fixture));
}

export function isProjectVisible(data: Pick<ProjectData, 'draft'>, production = isProductionBuild()): boolean {
  return !(production && data.draft);
}

export function sortArticles<T extends ArticleLike>(entries: T[]): T[] {
  return [...entries].sort((left, right) =>
    right.data.publishedAt.valueOf() - left.data.publishedAt.valueOf()
      || left.data.slug.localeCompare(right.data.slug));
}

export function sortProjects<T extends ProjectLike>(entries: T[]): T[] {
  return [...entries].sort((left, right) =>
    right.data.lastUpdated.valueOf() - left.data.lastUpdated.valueOf()
      || left.data.slug.localeCompare(right.data.slug));
}

export function assertContentIntegrity(
  articles: ArticleLike[],
  authorIds: Iterable<string>,
): void {
  const authors = new Set(authorIds);
  const slugs = new Set<string>();
  const episodes = new Set<string>();
  const guids = new Set<string>();

  for (const article of articles) {
    if (slugs.has(article.data.slug)) throw new Error(`Duplicate slug: ${article.data.slug}`);
    slugs.add(article.data.slug);
    for (const author of article.data.authors) {
      if (!authors.has(author)) throw new Error(`Unknown author ID: ${author}`);
    }
    if (article.data.episode && article.data.podcast) {
      const key = `${article.data.podcast.season}/${article.data.episode}`;
      if (episodes.has(key)) throw new Error(`Duplicate season/episode: ${key}`);
      episodes.add(key);
      if (guids.has(article.data.podcast.guid)) throw new Error(`Duplicate podcast GUID: ${article.data.podcast.guid}`);
      guids.add(article.data.podcast.guid);
    }
  }
}
