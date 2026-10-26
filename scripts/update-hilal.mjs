// Hijri month start dates from the Central Hilal Committee of North America (hilalcommittee.org).
// Reads each month's announcement ("Monday, October 12, 2026 will be the 1st day of Jumada al-Ula 1448 AH")
// and writes src/data/hijri-months.json, which the Niṣāb page uses for Hijri dates.
// Run by GitHub Actions (.github/workflows/hilal.yml): weekly, and whenever this script changes.

import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/hijri-months.json', import.meta.url);
const SITE = 'https://hilalcommittee.org';
const FROM = { y: 1445, m: 8 }; // Shaʿbān 1445 (the niṣāb records start on 1 March 2024)
const note = (msg) => console.log(`::warning title=hilal::${String(msg).replace(/\r?\n/g, ' ')}`);

async function get(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (darul-ifta-miami calendar)' }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

// Month names as the committee may spell them → month number.
const MONTHS = [
  [1, /^muh?arr?am/], [2, /^saf[ae]r/], [3, /^rabi.?\s*al.?\s*awwal|^rabi.?\s*ul.?\s*awwal|^rabi.?\s*(?:al.?)?\s*ula?$/], [4, /^rabi.?\s*al.?\s*th?ani|^rabi.?\s*ul.?\s*th?ani|^rabi.?\s*al.?\s*akhir/],
  [5, /^juma?d[ai].?\s*(?:al.?|ul.?)?\s*(?:ula|awwal|oola)/], [6, /^juma?d[ai].?\s*(?:al.?|ul.?|ath.?)?\s*(?:akhirah?|akhir|th?ani)/], [7, /^rajab/], [8, /^sh.?ab[ae]n/],
  [9, /^rama[dz]h?[ae]n/], [10, /^shaww?al/], [11, /^dh?u.?\s*(?:al.?|l.?)?\s*q.?[ae]?d/], [12, /^dh?u.?\s*(?:al.?|l.?)?\s*h.?ij/],
];
const monthNo = (name) => {
  const n = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ʿʾ'’`]/g, '').replace(/-/g, ' ').trim();
  return MONTHS.find(([, re]) => re.test(n))?.[0];
};
const GMONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// "Monday, October 12, 2026 will be the 1st day of Jumada al-Ula 1448 AH"
// "has declared Tuesday, June 16, 2026 as the first day of Muharram 1448"
const RE = /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})?[^.]{0,80}?\b(?:1\s*st|first)\s+day\s+of\s+(?:the\s+(?:month\s+of\s+)?)?([A-Za-zʿʾ'’\- ]{3,30}?)\s*,?\s*(14\d\d)/i;

function parse(html, url) {
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, ' ');
  const m = text.match(RE);
  if (!m) return null;
  const [, gMonth, gDay, gYear, hName, hYear] = m;
  const hm = monthNo(hName);
  if (!hm) { note(`Unknown month name "${hName}" in ${url}`); return null; }
  let year = gYear ? +gYear : null;
  if (!year) { const y = text.match(/\b(20\d\d)\b/); year = y ? +y[1] : null; }
  if (!year) return null;
  const start = `${year}-${String(GMONTHS.indexOf(gMonth) + 1).padStart(2, '0')}-${String(gDay).padStart(2, '0')}`;
  return { hijri: `${hYear}-${String(hm).padStart(2, '0')}`, start, url, statement: m[0].slice(0, 160) };
}


// Diagnostics (temporary): what the news page and one announcement look like.
if (process.env.HILAL_DEBUG) {
  try {
    const html = await get(`${SITE}/news`);
    const i = html.search(/load\s*more/i);
    note(`news: load-more context: ${html.slice(Math.max(0, i - 600), i + 300).replace(/\s+/g, ' ')}`);
    const api = [...new Set([...html.matchAll(/["'](\/[a-z0-9_\-\/]*(?:api|ajax|json|load|page|news)[a-z0-9_\-\/?=&.]*)["']/gi)].map((m) => m[1]))].slice(0, 30);
    note(`news: candidate endpoints: ${api.join(' , ')}`);
    const a = await get(`${SITE}/news/jumada-al-ula-1448-ah`);
    const t = a.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const j = t.search(/day of/i);
    note(`announcement text: ${t.slice(Math.max(0, j - 200), j + 120)}`);
  } catch (e) { note(`debug failed: ${e.message}`); }
}

// 1. Find the announcement pages: the sitemap first, then the news pages.
const urls = new Set();
try {
  const xml = await get(`${SITE}/sitemap.xml`);
  for (const [, u] of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) if (/\/news\/[^/]+$/.test(u) && !/-alert\/?$/.test(u)) urls.add(u);
  note(`Sitemap: ${urls.size} announcement pages.`);
} catch (e) { note(`Sitemap failed: ${e.message}`); }
for (let page = 1; page <= 8 && urls.size < 40; page++) {
  try {
    const html = await get(page === 1 ? `${SITE}/news` : `${SITE}/news?page=${page}`);
    const before = urls.size;
    for (const [, path] of html.matchAll(/href="((?:https:\/\/hilalcommittee\.org)?\/news\/[a-z0-9-]+)"/g)) if (!/-alert$/.test(path)) urls.add(path.startsWith('http') ? path : SITE + path);
    if (urls.size === before && page > 1) break;
  } catch (e) { note(`News page ${page} failed: ${e.message}`); break; }
}
note(`Announcement pages found: ${urls.size}.`);

// 2. Read each one.
let existing = [];
try { existing = JSON.parse(await readFile(OUT, 'utf8')); } catch {}
const byMonth = new Map(existing.map((e) => [e.hijri, e]));
const unread = [];
for (const url of urls) {
  try {
    const r = parse(await get(url), url);
    if (!r) { unread.push(url); continue; }
    const [y, m] = r.hijri.split('-').map(Number);
    if (y < FROM.y || (y === FROM.y && m < FROM.m)) continue;
    byMonth.set(r.hijri, { hijri: r.hijri, start: r.start, url: r.url });
  } catch (e) { unread.push(`${url} (${e.message})`); }
}
if (unread.length) note(`Could not read a start date from: ${unread.join(' | ')}`);

// 3. Check and save.
const out = [...byMonth.values()].sort((a, b) => a.hijri.localeCompare(b.hijri));
const gaps = [];
for (let i = 1; i < out.length; i++) {
  const [y0, m0] = out[i - 1].hijri.split('-').map(Number), [y1, m1] = out[i].hijri.split('-').map(Number);
  const consecutive = (y1 === y0 && m1 === m0 + 1) || (y1 === y0 + 1 && m0 === 12 && m1 === 1);
  const len = (Date.parse(out[i].start) - Date.parse(out[i - 1].start)) / 864e5;
  if (!consecutive) gaps.push(`missing between ${out[i - 1].hijri} and ${out[i].hijri}`);
  else if (len !== 29 && len !== 30) gaps.push(`${out[i - 1].hijri} would have ${len} days`);
}
if (gaps.length) note(`Check: ${gaps.join('; ')}`);
await writeFile(OUT, JSON.stringify(out, null, 2) + '\n');
note(`Saved ${out.length} months: ${out[0]?.hijri} (${out[0]?.start}) to ${out.at(-1)?.hijri} (${out.at(-1)?.start}).`);
