// Zakāh niṣāb update, twice a day: 5 am and 5 pm New York time. Run by GitHub Actions (see .github/workflows/nisab.yml).
// Fetches the gold and silver spot price in US dollars, works out the niṣāb, and writes src/data/nisab.json.
// The site rebuilds itself when that file changes. No accounts or API keys are needed.

import { readFile, writeFile } from 'node:fs/promises';

const FILE = new URL('../src/data/nisab.json', import.meta.url);
const GRAMS_PER_TROY_OZ = 31.1034768;
const SLOTS = [{ name: 'am', hour: 5 }, { name: 'pm', hour: 17 }]; // 5 am and 5 pm, New York time
const force = process.argv.includes('--force');

const nyNow = () => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false })
      .formatToParts(new Date()).map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) % 24 };
};

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'darul-ifta-miami-nisab' }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
}

// Source 1: Swissquote public quotes (mid of bid and ask).
async function swissquote(metal) {
  const data = await getJson(`https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/${metal}/USD`);
  const p = data?.[0]?.spreadProfilePrices?.[0];
  if (!p || typeof p.bid !== 'number' || typeof p.ask !== 'number') throw new Error('Swissquote: unexpected format');
  return (p.bid + p.ask) / 2;
}

// Source 2 (backup): gold-api.com.
async function goldApi(metal) {
  const data = await getJson(`https://api.gold-api.com/price/${metal}`);
  if (typeof data?.price !== 'number') throw new Error('gold-api: unexpected format');
  return data.price;
}

async function prices() {
  // Gold and silver always come from the same source, so the two figures are consistent.
  for (const [name, fn] of [['Swissquote', swissquote], ['gold-api.com', goldApi]]) {
    try {
      const [gold, silver] = await Promise.all([fn('XAU'), fn('XAG')]);
      return { source: name, gold, silver };
    } catch (e) {
      console.warn(`${name} failed: ${e.message}`);
    }
  }
  throw new Error('All price sources failed. The niṣāb was not updated; yesterday\'s figures remain on the site.');
}

const previous = JSON.parse(await readFile(FILE, 'utf8'));
const now = nyNow();

// The most recent slot that is due: 5 pm today, 5 am today, or (before 5 am) nothing new.
const due = [...SLOTS].reverse().find((s) => now.hour >= s.hour);
if (!force) {
  if (!due) { console.log(`Before 5 am in New York (${now.hour}:00). Skipping.`); process.exit(0); }
  if (previous.date === now.date && previous.slot === due.name) { console.log(`Already updated for ${now.date} ${due.name}. Skipping.`); process.exit(0); }
}

const { source, gold, silver } = await prices();

// Safety checks: reject impossible prices or sudden jumps, so a faulty feed never reaches the site.
if (!(gold > 500 && gold < 50000 && silver > 5 && silver < 2000)) throw new Error(`Prices out of range: gold ${gold}, silver ${silver}`);
for (const [label, now_, before] of [['gold', gold, previous.goldPerOz], ['silver', silver, previous.silverPerOz]]) {
  if (before && Math.abs(now_ - before) / before > 0.25) throw new Error(`${label} moved more than 25% in a day (${before} → ${now_}). Not updating; please check.`);
}

const round2 = (n) => Math.round(n * 100) / 100;
const out = {
  date: now.date,
  slot: due ? due.name : 'manual',
  updatedAt: new Date().toISOString(),
  source,
  goldPerOz: round2(gold),
  silverPerOz: round2(silver),
  goldGrams: previous.goldGrams,
  silverGrams: previous.silverGrams,
  goldNisab: round2((gold / GRAMS_PER_TROY_OZ) * previous.goldGrams),
  silverNisab: round2((silver / GRAMS_PER_TROY_OZ) * previous.silverGrams),
};
await writeFile(FILE, JSON.stringify(out, null, 2) + '\n');
console.log('Updated:', out);
