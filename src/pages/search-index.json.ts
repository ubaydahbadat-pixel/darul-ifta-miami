// The search index for the site search box: one entry per published fatwa. Built with the site.
import { getFatawa, fatwaUrl } from '../data/fatawa';
import { categoryName, categories } from '../data/categories';
import { synonymGroups, stopWords } from '../data/search-synonyms';

// Markdown to plain text, enough for searching and a short preview.
const plain = (s = '') =>
  s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export async function GET() {
  const fatawa = await getFatawa();
  const items = fatawa.map((f) => ({
    t: f.data.title,
    u: fatwaUrl(f),
    c: categoryName(f.data.category),
    cb: categories.find((c) => c.id === f.data.category)?.blurb ?? '',
    p: f.data.topic,
    q: plain(f.data.question),
    s: plain(f.data.short_answer),
  }));
  return new Response(JSON.stringify({ items, synonyms: synonymGroups, stop: stopWords }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
