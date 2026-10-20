import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categoryIds } from './data/categories';

const fatawa = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/fatawa' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(categoryIds),
    topic: z.string(),
    date: z.coerce.date(),
    pdf: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { fatawa, articles };
