import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildBlogPosting,
  buildBreadcrumbs,
  buildOrganization,
  buildPerson,
  buildProject,
  buildVideoObject,
  buildWebsite,
} from '../src/utils/structured-data.ts';

const author = { name: 'DJ Wynyard', slug: 'dj', avatar: null, website: 'https://usefulstash.com', socials: {} };

test('blog posting data uses canonical URLs, visible dates, image, and resolved authors', () => {
  const value = buildBlogPosting({
    title: 'Useful title', description: 'Useful description', slug: 'useful-title',
    publishedAt: new Date('2026-09-18T00:00:00Z'), updatedAt: new Date('2026-09-19T00:00:00Z'),
    heroImage: '/social-card.png', authors: [author],
  });
  assert.equal(value['@type'], 'BlogPosting');
  assert.equal(value.mainEntityOfPage, 'https://usefulstash.com/stash/useful-title/');
  assert.equal(value.image, 'https://usefulstash.com/social-card.png');
  assert.deepEqual(value.author, [{ '@type': 'Person', name: 'DJ Wynyard', url: 'https://usefulstash.com/authors/dj/' }]);
  assert.equal(value.dateModified, '2026-09-19T00:00:00.000Z');
});

test('video, project, breadcrumb, person, website, and organization data stay factual', () => {
  const video = buildVideoObject({
    title: 'Useful video', description: 'Watch the useful video.', slug: 'useful-video',
    publishedAt: new Date('2026-09-18T00:00:00Z'), heroImage: '/social-card.png',
    contentUrl: 'https://media.usefulstash.com/video.mp4',
  });
  assert.equal(video['@type'], 'VideoObject');
  assert.equal(video.contentUrl, 'https://media.usefulstash.com/video.mp4');
  assert.equal('duration' in video, false);

  assert.equal(buildProject({ title: 'Project', description: 'Description', slug: 'project', publishedAt: new Date('2026-09-01'), lastUpdated: new Date('2026-09-18') }).url, 'https://usefulstash.com/projects/project/');
  assert.equal(buildBreadcrumbs([{ name: 'Home', path: '/' }, { name: 'Stash', path: '/stash/' }]).itemListElement.length, 2);
  assert.deepEqual(buildPerson(author).sameAs, ['https://usefulstash.com']);
  assert.equal(buildWebsite()['@type'], 'WebSite');
  assert.equal(buildOrganization().name, 'Useful Stash');
});

test('person data resolves a local portrait to its public canonical URL', () => {
  const person = buildPerson({ ...author, avatar: '/images/authors/dj.png' });

  assert.equal(person.image, 'https://usefulstash.com/images/authors/dj.png');
});
