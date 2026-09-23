import { site } from '../config/site.ts';

type AuthorIdentity = {
  name: string;
  slug: string;
  avatar?: string | null;
  website?: string | null;
  socials?: Record<string, string | null | undefined>;
};

const absolute = (path: string) => new URL(path, site.url).href;

export function buildOrganization() {
  return { '@context': 'https://schema.org', '@type': 'Organization', name: site.name, url: absolute('/') };
}

export function buildWebsite() {
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: absolute('/'), publisher: buildOrganization() };
}

export function buildPerson(author: AuthorIdentity) {
  const sameAs = [author.website, ...Object.values(author.socials ?? {})].filter((value): value is string => Boolean(value));
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: absolute(`/authors/${author.slug}/`),
    ...(author.avatar ? { image: absolute(author.avatar) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function buildBlogPosting(input: {
  title: string; description: string; slug: string; publishedAt: Date; updatedAt?: Date;
  heroImage?: string; authors: AuthorIdentity[]; canonical?: string | null;
}) {
  const canonical = input.canonical ?? absolute(`/stash/${input.slug}/`);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    mainEntityOfPage: canonical,
    datePublished: input.publishedAt.toISOString(),
    dateModified: (input.updatedAt ?? input.publishedAt).toISOString(),
    ...(input.heroImage ? { image: absolute(input.heroImage) } : {}),
    author: input.authors.map((author) => ({ '@type': 'Person', name: author.name, url: absolute(`/authors/${author.slug}/`) })),
    publisher: buildOrganization(),
  };
}

export function buildVideoObject(input: {
  title: string; description: string; slug: string; publishedAt: Date; heroImage: string; contentUrl: string; duration?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: input.title,
    description: input.description,
    thumbnailUrl: absolute(input.heroImage),
    uploadDate: input.publishedAt.toISOString(),
    contentUrl: input.contentUrl,
    embedUrl: absolute(`/stash/${input.slug}/watch/`),
    ...(input.duration ? { duration: input.duration } : {}),
  };
}

export function buildBreadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: absolute(item.path),
    })),
  };
}

export function buildProject(input: { title: string; description: string; slug: string; publishedAt: Date; lastUpdated: Date }) {
  return {
    '@context': 'https://schema.org', '@type': 'CreativeWork', name: input.title, description: input.description,
    url: absolute(`/projects/${input.slug}/`), datePublished: input.publishedAt.toISOString(), dateModified: input.lastUpdated.toISOString(),
    publisher: buildOrganization(),
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}
