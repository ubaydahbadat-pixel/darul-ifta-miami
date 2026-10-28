// Builds the Madhhab section's data from the Scholars, Books and Places entries.
// Every link (teacher/student, influenced by/influenced) counts in both directions,
// so it only needs entering once, on either side.
import { getCollection } from 'astro:content';

export type Scholar = {
  id: string; name: string; short: string; tabaqah: string | null; deathAh: number | null; approx: boolean;
  places: string[]; teachers: string[]; students: string[]; books: string[]; recensions: string[];
};
export type Book = {
  id: string; title: string; author: string | null; recensionBy: string[];
  type: string | null; basedOn: string[]; derived: string[]; place: string | null; content: string;
  fiqhPoints: string[]; influencedBy: string[]; influenced: string[];
};
export type Place = { id: string; name: string; lat: number; lng: number };

const uniq = (a: string[]) => [...new Set(a)];

// The groups on the Scholars page, in order. Keep the same list in public/admin/config.yml (Ṭabaqah field).
export const TABAQAT = ['Ṣaḥābah', 'Tābiʿūn', 'Imāms of Fiqh',
  ...Array.from({ length: 10 }, (_, i) => `Ṭabaqah ${i + 1}`)];

// Kinds of work, as offered in /admin (Books → Type of work). Keep the two lists the same.
// `plural` is the heading on the base book's page.
export const WORK_TYPES = [
  { name: 'Original work', plural: '' },
  { name: 'Commentary (Sharḥ)', plural: 'Commentaries (Shurūḥ)' },
  { name: 'Abridgement (Mukhtaṣar)', plural: 'Abridgements (Mukhtaṣarāt)' },
  { name: 'Gloss (Ḥāshiyah)', plural: 'Glosses (Ḥawāshī)' },
  { name: 'Other', plural: 'Other works based on it' },
];
export const shortType = (t: string | null) => (t ? t.replace(/\s*\(.*\)$/, '') : '');

export function deathLabel(s: { deathAh: number | null; approx: boolean }) {
  if (s.deathAh == null) return '';
  return `d. ${s.approx ? 'c. ' : ''}${s.deathAh} AH`;
}

export async function loadMadhhab() {
  const visible = (e: { data: { draft?: boolean } }) => import.meta.env.DEV || !e.data.draft;
  const placeEntries = await getCollection('places');
  const scholarEntries = (await getCollection('scholars')).filter(visible);
  const bookEntries = (await getCollection('books')).filter(visible);

  const places = new Map<string, Place>(placeEntries.map((p) => [p.id, { id: p.id, name: p.data.name, lat: p.data.latitude, lng: p.data.longitude }]));
  const scholars = new Map<string, Scholar>(scholarEntries.map((e) => [e.id, {
    id: e.id, name: e.data.name, short: e.data.short_name?.trim() || e.data.name, tabaqah: e.data.tabaqah?.trim() || null,
    deathAh: e.data.death_ah ?? null, approx: e.data.death_approximate,
    places: e.data.places.filter((p) => places.has(p)), teachers: [...e.data.teachers], students: [...e.data.students], books: [], recensions: [],
  }]));
  const books = new Map<string, Book>(bookEntries.map((e) => [e.id, {
    id: e.id, title: e.data.title, author: e.data.author ?? null, recensionBy: [...e.data.recension_by],
    type: e.data.work_type?.trim() || null, basedOn: [...e.data.based_on], derived: [], place: e.data.place ?? null,
    content: e.data.content, fiqhPoints: e.data.fiqh_points,
    influencedBy: [...e.data.influenced_by], influenced: [...e.data.influenced],
  }]));

  // Mirror each link onto the other side, and drop links to entries that don't exist or are drafts.
  for (const s of scholars.values()) {
    for (const t of s.teachers) scholars.get(t)?.students.push(s.id);
    for (const st of s.students) scholars.get(st)?.teachers.push(s.id);
  }
  for (const s of scholars.values()) {
    s.teachers = uniq(s.teachers).filter((x) => scholars.has(x) && x !== s.id);
    s.students = uniq(s.students).filter((x) => scholars.has(x) && x !== s.id);
  }
  for (const b of books.values()) {
    for (const x of b.influencedBy) books.get(x)?.influenced.push(b.id);
    for (const x of b.influenced) books.get(x)?.influencedBy.push(b.id);
    if (b.author && !scholars.has(b.author)) b.author = null;
    if (b.place && !places.has(b.place)) b.place = null;
    if (b.author) scholars.get(b.author)!.books.push(b.id);
    b.recensionBy = uniq(b.recensionBy).filter((x) => scholars.has(x));
    for (const x of b.recensionBy) scholars.get(x)!.recensions.push(b.id);
  }
  // Works based on another book (commentaries, abridgements, glosses) are listed on the base book.
  for (const b of books.values()) {
    b.basedOn = uniq(b.basedOn).filter((x) => books.has(x) && x !== b.id);
    for (const x of b.basedOn) books.get(x)!.derived.push(b.id);
  }
  for (const b of books.values()) {
    b.influencedBy = uniq(b.influencedBy).filter((x) => books.has(x) && x !== b.id);
    b.influenced = uniq(b.influenced).filter((x) => books.has(x) && x !== b.id);
  }

  const byDeath = (a: number | null, b: number | null) => (a ?? 1e9) - (b ?? 1e9);
  const scholarList = [...scholars.values()].sort((a, b) => byDeath(a.deathAh, b.deathAh) || a.name.localeCompare(b.name));
  const authorDeath = (b: Book) => (b.author ? scholars.get(b.author)!.deathAh : null);
  const bookList = [...books.values()].sort((a, b) => byDeath(authorDeath(a), authorDeath(b)) || a.title.localeCompare(b.title));
  // A book with no place of its own is shown at its author's main place.
  const bookPlace = (b: Book) => b.place ?? (b.author ? scholars.get(b.author)!.places[0] ?? null : null);

  return { places, scholars, books, scholarList, bookList, bookPlace };
}
