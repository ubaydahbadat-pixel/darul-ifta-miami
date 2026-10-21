import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categoryIds } from './data/categories';

// Each fatwa is one file. Every section is its own field, filled in from the /admin form.
const fatawa = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/fatawa' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(categoryIds),
    topic: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    question: z.string().default(''),
    short_answer: z.string().default(''),
    primary: z.string().default(''),
    supplementary: z.string().default(''),
    hikmah: z.string().default(''),
    references: z
      .array(z.object({
        source: z.string(),
        language: z.enum(['Arabic', 'Urdu']).default('Arabic'),
        text: z.string().default(''),
      }))
      .default([]),
    pdf: z.string().optional(),
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
