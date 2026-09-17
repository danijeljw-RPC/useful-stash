import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: { site: URL }) {
  const articles = (await getCollection('articles', ({ data }) => !data.draft))
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());

  return rss({
    title: 'Useful Stash',
    description: 'Practical guides, tools, experiments, and useful discoveries worth keeping.',
    site: context.site,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishedAt,
      link: `/stash/${article.id}/`,
      categories: article.data.tags,
    })),
    customData: '<language>en-au</language>',
  });
}
