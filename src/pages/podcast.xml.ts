import { getCollection } from 'astro:content';
import { isArticleVisible, sortArticles } from '../utils/content';
import { rssResponse } from '../utils/feed-xml';
import { serializePodcastFeed } from '../utils/podcast-rss';

export const prerender = true;
export async function GET() {
  const articles = sortArticles(await getCollection('articles')).filter(({ data }) => isArticleVisible(data, true));
  return rssResponse(serializePodcastFeed(articles.map(({ data }) => data)));
}

