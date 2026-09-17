import { getCollection } from 'astro:content';
import { isArticleVisible, sortArticles } from '../utils/content';
import { rssResponse } from '../utils/feed-xml';
import { serializeVideocastFeed } from '../utils/videocast-rss';

export const prerender = true;
export async function GET() {
  const articles = sortArticles(await getCollection('articles')).filter(({ data }) => isArticleVisible(data, true));
  return rssResponse(serializeVideocastFeed(articles.map(({ data }) => data)));
}
