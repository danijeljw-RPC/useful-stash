import { podcast } from '../config/podcast.ts';
import { site } from '../config/site.ts';
import type { ArticleData } from '../schemas/content.ts';
import { cdata, escapeXml, rssDocument } from './feed-xml.ts';

type Episode = ArticleData & Required<Pick<ArticleData, 'audio' | 'episode' | 'podcast'>>;
const eligible = (value: ArticleData): value is Episode => Boolean(value.audio && value.episode && value.podcast);

function channelHeader(selfUrl: string, title: string): string {
  const artwork = new URL(podcast.artwork, site.url).href;
  return `<title>${escapeXml(title)}</title>
<link>${site.url}/</link>
<description>${escapeXml(podcast.description)}</description>
<language>${podcast.language}</language>
<atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />
<itunes:author>${escapeXml(podcast.author)}</itunes:author>
<itunes:owner><itunes:name>${escapeXml(podcast.ownerName)}</itunes:name><itunes:email>${escapeXml(podcast.ownerEmail)}</itunes:email></itunes:owner>
<itunes:explicit>${podcast.explicit}</itunes:explicit>
<itunes:category text="${escapeXml(podcast.category)}" />
<itunes:image href="${escapeXml(artwork)}" />`;
}

export function serializePodcastFeed(values: ArticleData[]): string {
  const items = values.filter(eligible).sort((a, b) => b.publishedAt.valueOf() - a.publishedAt.valueOf() || a.slug.localeCompare(b.slug));
  const xml = items.map((item) => `<item>
<title>${escapeXml(item.title)}</title><link>${site.url}/stash/${item.slug}/</link>
<guid isPermaLink="false">${escapeXml(item.podcast.guid)}</guid>
<description>${cdata(item.description)}</description><pubDate>${item.publishedAt.toUTCString()}</pubDate>
<enclosure url="${escapeXml(item.audio.url)}" length="${item.audio.bytes}" type="${item.audio.mimeType}" />
<itunes:season>${item.podcast.season}</itunes:season><itunes:episode>${item.episode}</itunes:episode>
<itunes:episodeType>${item.podcast.episodeType}</itunes:episodeType><itunes:explicit>${item.podcast.explicit}</itunes:explicit>
${item.transcript ? `<podcast:transcript url="${escapeXml(item.transcript)}" type="text/vtt" />` : ''}
</item>`).join('\n');
  return rssDocument(`${channelHeader(`${site.url}/podcast.xml`, podcast.title)}\n${xml}`, ' xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:podcast="https://podcastindex.org/namespace/1.0"');
}

export { channelHeader };

