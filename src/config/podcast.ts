export const podcast = {
  title: 'Useful Stash',
  description:
    'Practical guides, technical experiments, tools, and conversations about building, fixing, and understanding useful things.',
  author: 'DJ Wynyard',
  ownerName: 'RePass Cloud',
  ownerEmail: 'hello@usefulstash.com',
  language: 'en-AU',
  explicit: false,
  category: 'Technology',
  artwork: '/images/podcast/useful-stash-podcast.jpg',
} as const;

export const videocast = {
  ...podcast,
  title: 'Useful Stash',
} as const;

