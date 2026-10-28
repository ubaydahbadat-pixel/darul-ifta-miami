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
    // The Explanation is a list of numbered sections ("nodes"), each with a heading and text.
    explanation: z
      .array(z.object({ heading: z.string(), text: z.string().default('') }))
      .default([]),
    hikmah: z.string().default(''),
    references: z
      .array(z.object({
        source: z.string(),
        language: z.enum(['Arabic', 'Urdu', 'Persian', 'English', 'German', 'French']).default('Arabic'),
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

// ── Madhhab section ───────────────────────────────────────────────
// Places: one file each, with coordinates for the map.
const places = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/places' }),
  schema: z.object({ name: z.string(), latitude: z.number(), longitude: z.number() }),
});

const ids = z.array(z.string()).nullish().transform((v) => (v ?? []).filter(Boolean));

// Scholars. Teachers/students are links to other scholar entries; each link shows on both pages.
// Books written are taken from the Books entries automatically.
const scholars = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/scholars' }),
  schema: z.object({
    name: z.string(),
    short_name: z.string().nullish(),
    death_ah: z.number().nullish(),
    death_approximate: z.boolean().default(false),
    places: ids,
    teachers: ids,
    students: ids,
    draft: z.boolean().default(true),
  }),
});

// Books. The author's death date is taken from the author's scholar entry.
const books = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    author: z.string().nullish(),
    place: z.string().nullish(),
    content: z.string().default(''),
    fiqh_points: z.array(z.string()).nullish().transform((v) => (v ?? []).filter((x) => x && x.trim())),
    recension_by: ids,
    influenced_by: ids,
    influenced: ids,
    draft: z.boolean().default(true),
  }),
});

export const collections = { fatawa, articles, places, scholars, books };
