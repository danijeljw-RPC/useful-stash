import { getCollection } from 'astro:content';
import { isArticleVisible, sortArticles, sortProjects } from '../utils/content';
import { rssResponse, serializeSiteFeed } from '../utils/feed-xml';

export const prerender = true;
export async function GET() {
  const articles = sortArticles(await getCollection('articles')).filter(({ data }) => isArticleVisible(data, true));
  const projects = sortProjects(await getCollection('projects')).filter(({ data }) => !data.draft);
  return rssResponse(serializeSiteFeed(articles.map(({ data }) => data), projects.map(({ data }) => data)));
}
