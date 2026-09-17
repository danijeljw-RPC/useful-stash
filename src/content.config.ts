import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema, authorSchema, projectSchema } from './schemas/content';

const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.{md,mdx}' }),
  schema: articleSchema,
});

const authors = defineCollection({
  loader: glob({ base: './src/content/authors', pattern: '**/*.{md,mdx}' }),
  schema: authorSchema,
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: projectSchema,
});

export const collections = { articles, authors, projects };
