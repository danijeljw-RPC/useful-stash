import { z } from 'zod';
import { resolveMediaUrl } from '../utils/media-url.ts';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase kebab-case slug.');
const httpsUrl = z.url().refine((value) => value.startsWith('https://'), 'URL must use HTTPS.');
const nullableHttpsUrl = httpsUrl.nullable().default(null);
const localImagePath = z.string().regex(/^\/(?!\/)[^\s]+$/, 'Local image paths must start with a single slash.');
const nullableAuthorImage = z.union([httpsUrl, localImagePath]).nullable().default(null);
const mediaUrl = z.unknown().transform((value, context) => {
  try {
    return resolveMediaUrl(value);
  } catch (error) {
    context.addIssue({ code: 'custom', message: error instanceof Error ? error.message : 'Invalid media URL.' });
    return z.NEVER;
  }
});

const enclosureSchema = z.object({
  url: mediaUrl,
  mimeType: z.literal('audio/mpeg'),
  bytes: z.number().int().positive(),
}).strict();

const videoSchema = z.object({
  youtube: nullableHttpsUrl,
  hosted: mediaUrl.optional(),
  mimeType: z.literal('video/mp4').optional(),
  bytes: z.number().int().positive().optional(),
  spotify: nullableHttpsUrl,
}).strict().superRefine((value, context) => {
  const hostedFields = [value.hosted, value.mimeType, value.bytes];
  const present = hostedFields.filter((field) => field !== undefined).length;
  if (present !== 0 && present !== hostedFields.length) {
    context.addIssue({ code: 'custom', message: 'Hosted video URL, MIME type, and byte length are all required together.' });
  }
});

const duration = z.string().regex(/^(?:\d+:[0-5]\d|\d+:[0-5]\d:[0-5]\d)$/, 'Use "mm:ss" or "h:mm:ss".');

const podcastSchema = z.object({
  guid: z.string().regex(/^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i),
  season: z.number().int().positive(),
  episodeType: z.enum(['full', 'trailer', 'bonus']),
  explicit: z.boolean().default(false),
  spotify: nullableHttpsUrl,
  applePodcasts: nullableHttpsUrl,
}).strict();

export const seoSchema = z.object({
  canonical: nullableHttpsUrl,
  noindex: z.boolean().default(false),
}).strict();

export const articleSchema = z.object({
  title: z.string().trim().min(1),
  slug,
  description: z.string().trim().min(1),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  fixture: z.boolean().default(false),
  tags: z.array(z.string().trim().min(1)).min(1),
  authors: z.array(slug).min(1),
  takeaway: z.string().trim().min(1).optional(),
  heroImage: z.string().startsWith('/').optional(),
  heroImageAlt: z.string().optional(),
  seo: seoSchema,
  articleAudio: enclosureSchema.optional(),
  audio: enclosureSchema.optional(),
  video: videoSchema.optional(),
  transcript: mediaUrl.optional(),
  duration: duration.optional(),
  series: z.string().trim().min(1).optional(),
  episode: z.number().int().positive().optional(),
  podcast: podcastSchema.optional(),
}).strict().superRefine((value, context) => {
  if (Boolean(value.heroImage) !== (value.heroImageAlt !== undefined)) {
    context.addIssue({ code: 'custom', message: 'Hero image and alternative text are required together.' });
  }
  if (value.duration && !value.audio) {
    context.addIssue({ code: 'custom', message: 'Duration describes the podcast audio, so audio is required with it.' });
  }
  if (Boolean(value.episode) !== Boolean(value.podcast)) {
    context.addIssue({ code: 'custom', message: 'Episode number and podcast metadata are required together.' });
  }
});

export const authorSchema = z.object({
  name: z.string().trim().min(1),
  slug,
  role: z.string().trim().min(1),
  bio: z.string().trim().min(1).nullable().default(null),
  avatar: nullableAuthorImage,
  avatarAlt: z.string(),
  website: nullableHttpsUrl,
  profile: z.object({
    location: z.string().trim().min(1),
    experience: z.string().trim().min(1),
    specialties: z.array(z.string().trim().min(1)).min(1).max(6),
  }).strict().nullable().default(null),
  socials: z.object({
    github: nullableHttpsUrl,
    x: nullableHttpsUrl,
    bluesky: nullableHttpsUrl,
    mastodon: nullableHttpsUrl,
    twitch: nullableHttpsUrl,
    youtube: nullableHttpsUrl,
    linkedin: nullableHttpsUrl,
  }).strict(),
  seo: seoSchema,
}).strict();

export const projectSchema = z.object({
  title: z.string().trim().min(1),
  slug,
  description: z.string().trim().min(1),
  publishedAt: z.coerce.date(),
  lastUpdated: z.coerce.date(),
  draft: z.boolean().default(false),
}).strict();

export type ArticleData = z.infer<typeof articleSchema>;
export type AuthorData = z.infer<typeof authorSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
