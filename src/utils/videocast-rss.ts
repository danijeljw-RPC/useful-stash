import { videocast } from '../config/podcast.ts';
import { site } from '../config/site.ts';
import type { ArticleData } from '../schemas/content.ts';
import { cdata, escapeXml, rssDocument } from './feed-xml.ts';
import { channelHeader } from './podcast-rss.ts';

type VideoEpisode = ArticleData & Required<Pick<ArticleData, 'video' | 'episode' | 'podcast'>> & { video: NonNullable<ArticleData['video']> & Required<Pick<NonNullable<ArticleData['video']>, 'hosted' | 'mimeType' | 'bytes'>> };
const eligible = (value: ArticleData): value is VideoEpisode => Boolean(value.video?.hosted && value.video.mimeType && value.video.bytes && value.episode && value.podcast);

export function serializeVideocastFeed(values: ArticleData[]): string {
  const items = values.filter(eligible).sort((a, b) => b.publishedAt.valueOf() - a.publishedAt.valueOf() || a.slug.localeCompare(b.slug));
  const xml = items.map((item) => `<item>
<title>${escapeXml(item.title)}</title><link>${site.url}/stash/${item.slug}/watch/</link>
<guid isPermaLink="false">${escapeXml(`${item.podcast.guid}-video`)}</guid>
<description>${cdata(item.description)}</description><pubDate>${item.publishedAt.toUTCString()}</pubDate>
<enclosure url="${escapeXml(item.video.hosted)}" length="${item.video.bytes}" type="${item.video.mimeType}" />
<itunes:season>${item.podcast.season}</itunes:season><itunes:episode>${item.episode}</itunes:episode>
<itunes:episodeType>${item.podcast.episodeType}</itunes:episodeType><itunes:explicit>${item.podcast.explicit}</itunes:explicit>
${item.transcript ? `<podcast:transcript url="${escapeXml(item.transcript)}" type="text/vtt" />` : ''}
</item>`).join('\n');
  return rssDocument(`${channelHeader(`${site.url}/videocast.xml`, videocast.title)}\n${xml}`, ' xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:podcast="https://podcastindex.org/namespace/1.0"');
}
