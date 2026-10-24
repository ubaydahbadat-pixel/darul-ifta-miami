import { getCollection, type CollectionEntry } from 'astro:content';
import { slugify } from './categories';

export type Fatwa = CollectionEntry<'fatawa'>;

export async function getFatawa() {
  const all = await getCollection('fatawa', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function fatwaSlug(f: Fatwa) {
  return f.id.split('/').pop()!;
}

// The link uses the Arabic term in brackets if there is one: "Ablution (Wuḍūʾ)" → "wudu".
export function topicSlug(f: Fatwa) {
  const bracket = f.data.topic.match(/\(([^)]+)\)\s*$/);
  return slugify(bracket ? bracket[1] : f.data.topic);
}

export function fatwaUrl(f: Fatwa) {
  return `/fatawa/${f.data.category}/${topicSlug(f)}/${fatwaSlug(f)}/`;
}

export function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
