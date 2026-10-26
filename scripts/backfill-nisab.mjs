// One-off backfill of the niṣāb price history, from 1 March 2024 (before Ramaḍān 1445) up to the start of our own 5 am log.
// Run by GitHub Actions (.github/workflows/nisab-backfill.yml), because the prices come from the internet.
//
// Source: the LBMA benchmark prices, the official daily London prices for gold and silver in US dollars.
//   Gold: the LBMA Gold Price AM, set at 10:30 London time (about 5:30–6:30 am New York time).
//   Silver: the LBMA Silver Price, set once a day at 12:00 London time (about 7–8 am New York time).
// (re-run 2)
// Backup source: Stooq daily spot closing prices (XAUUSD, XAGUSD).
// Days with no price (weekends and London holidays) are left out; the Niṣāb page uses the last earlier price.
// Entries already in the log from our own 5 am updates are never overwritten.

import { readFile, writeFile } from 'node:fs/promises';

// Messages are also shown as GitHub annotations on the run, so they can be read without the full log.
const note = (msg) => console.log(`::warning title=backfill::${String(msg).replace(/\r?\n/g, ' ')}`);

const HISTORY = new URL('../src/data/nisab-history.json', import.meta.url);
const NISAB = new URL('../src/data/nisab.json', import.meta.url);
const FROM = '2024-03-01';
const GRAMS_PER_TROY_OZ = 31.1034768;

async function get(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (darul-ifta-miami niṣāb history)' }, signal: AbortSignal.timeout(30000) });
  const text = await res.text();
  note(`${url} → HTTP ${res.status}, ${text.length} bytes. Starts: ${text.slice(0, 160).replace(/\s+/g, ' ')}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return text;
}

// LBMA JSON: [{ "d": "YYYY-MM-DD", "v": [usd, gbp, eur] }, ...]
async function lbma() {
  const parse = (text) => {
    const rows = JSON.parse(text);
    const map = new Map();
    for (const r of rows) if (r?.d >= FROM && typeof r.v?.[0] === 'number' && r.v[0] > 0) map.set(r.d, r.v[0]);
    return map;
  };
  const gold = parse(await get('https://prices.lbma.org.uk/json/gold_am.json'));
  const silver = parse(await get('https://prices.lbma.org.uk/json/silver.json'));
  return { name: 'LBMA (gold AM, silver)', gold, silver };
}

// Stooq CSV: Date,Open,High,Low,Close[,Volume]
async function stooq() {
  const parse = (text) => {
    const [head, ...lines] = text.trim().split(/\r?\n/);
    const cols = head.split(',');
    const iD = cols.indexOf('Date'), iC = cols.indexOf('Close');
    if (iD < 0 || iC < 0) throw new Error('unexpected Stooq format');
    const map = new Map();
    for (const l of lines) { const c = l.split(','); const v = Number(c[iC]); if (c[iD] >= FROM && v > 0) map.set(c[iD], v); }
    return map;
  };
  const gold = parse(await get('https://stooq.com/q/d/l/?s=xauusd&i=d'));
  const silver = parse(await get('https://stooq.com/q/d/l/?s=xagusd&i=d'));
  return { name: 'Stooq (daily close)', gold, silver };
}

let src;
for (const fn of [lbma, stooq]) {
  try {
    src = await fn();
    if (src.gold.size < 300 || src.silver.size < 300) throw new Error(`too few days (gold ${src.gold.size}, silver ${src.silver.size})`);
    break;
  } catch (e) { note(`${fn.name} failed: ${e.message}`); src = null; }
}
if (!src) throw new Error('No historical source worked. Nothing was changed.');

const { goldGrams, silverGrams } = JSON.parse(await readFile(NISAB, 'utf8'));
let history = [];
try { history = JSON.parse(await readFile(HISTORY, 'utf8')); } catch {}
const ownStart = history.filter((h) => !h.backfill).map((h) => h.date).sort()[0] || '9999-12-31';
const own = history.filter((h) => !h.backfill);

const round2 = (n) => Math.round(n * 100) / 100;
const added = [];
for (const [date, g] of [...src.gold].sort()) {
  const s = src.silver.get(date);
  if (!s || date >= ownStart) continue;
  if (!(g > 500 && g < 50000 && s > 5 && s < 2000)) { console.warn(`Skipping ${date}: out of range (${g}, ${s})`); continue; }
  added.push({
    date, goldPerOz: round2(g), silverPerOz: round2(s),
    goldNisab: round2((g / GRAMS_PER_TROY_OZ) * goldGrams), silverNisab: round2((s / GRAMS_PER_TROY_OZ) * silverGrams),
    source: src.name, backfill: true,
  });
}
const out = [...added, ...own].sort((a, b) => a.date.localeCompare(b.date));
await writeFile(HISTORY, JSON.stringify(out, null, 2) + '\n');
note(`Backfilled ${added.length} days from ${src.name} (${added[0]?.date} – ${added.at(-1)?.date}); kept ${own.length} days from our own 5 am log. Total ${out.length}.`);
