// Writes the portable content archive in portable/ — every piece of the site's content in plain,
// framework-free formats (JSON, Markdown, CSV, HTML fragments), for a future rebuild of the site
// without Astro. The live site never reads from portable/. Run after `astro build` (it reads dist/
// for the URL list and the static page texts). Run by .github/workflows/portable.yml.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const OUT = 'portable';
const rm = (p) => fs.rmSync(p, { recursive: true, force: true });
const mk = (p) => fs.mkdirSync(p, { recursive: true });
const write = (p, s) => { mk(path.dirname(p)); fs.writeFileSync(p, s.endsWith('\n') ? s : s + '\n'); };
const json = (v) => JSON.stringify(v, null, 2);

// Keep README.md (hand-written); regenerate everything else.
for (const d of ['content', 'data', 'pages', 'assets', 'logic']) rm(path.join(OUT, d));
rm(path.join(OUT, 'urls.csv'));

function frontMatter(file) {
  const t = fs.readFileSync(file, 'utf8');
  const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return m ? { data: parse(m[1]) ?? {}, body: m[2].trim() } : { data: {}, body: t.trim() };
}
const listDir = (d, ext) => (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith(ext)).sort() : []);
const id = (f) => f.replace(/\.[^.]+$/, '');

// ── URLs of every built page ──
const urls = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f === 'index.html' || (f.endsWith('.html') && f !== 'index.html')) urls.push('/' + path.relative('dist', p).replace(/index\.html$/, '').replace(/\\/g, '/'));
  }
})('dist');
urls.sort();

// ── Fatāwā (drafts included, marked) ──
const categories = (() => {
  const src = fs.readFileSync('src/data/categories.ts', 'utf8');
  return [...src.matchAll(/\{ id: '([^']+)', name: '([^']+)', blurb: '([^']*)' \}/g)].map((m) => ({ id: m[1], name: m[2], blurb: m[3] }));
})();
const fatawa = listDir('src/content/fatawa', '.md').map((f) => {
  const { data } = frontMatter(path.join('src/content/fatawa', f));
  const slug = id(f);
  const url = urls.find((u) => u.startsWith('/fatawa/') && u.endsWith(`/${slug}/`)) ?? null;
  return {
    id: slug, url, draft: !!data.draft, category: data.category, topic: data.topic, title: data.title,
    date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? ''),
    question: data.question ?? '', short_answer: data.short_answer ?? '',
    explanation: data.explanation ?? [], hikmah: data.hikmah ?? '', references: data.references ?? [],
  };
});
for (const f of fatawa) {
  write(`${OUT}/content/fatawa/${f.id}.json`, json(f));
  // The same fatwa as one readable Markdown file.
  const md = [`# ${f.title}`, '', `Category: ${categories.find((c) => c.id === f.category)?.name ?? f.category}  `, `Topic: ${f.topic}  `, `Date: ${f.date}${f.draft ? '  \nStatus: DRAFT (not published)' : ''}`, ''];
  if (f.question) md.push('## Question', '', f.question, '');
  if (f.short_answer) md.push('## Short Answer', '', f.short_answer, '');
  if (f.explanation.length) md.push('## Explanation', '', ...f.explanation.flatMap((e, i) => [`### ${i + 1}. ${e.heading}`, '', e.text ?? '', '']));
  if (f.hikmah) md.push('## Wisdom of the Ruling (Ḥikmah)', '', f.hikmah, '');
  if (f.references.length) md.push('## References', '', ...f.references.flatMap((r, i) => [`### ${i + 1}. ${r.source}`, '', `Language: ${r.language ?? 'Arabic'}`, '', r.text ?? '', '']));
  write(`${OUT}/content/fatawa-readable/${f.id}.md`, md.join('\n'));
}
write(`${OUT}/content/categories.json`, json(categories));

// ── Articles ──
const articles = listDir('src/content/articles', '.md').map((f) => {
  const { data, body } = frontMatter(path.join('src/content/articles', f));
  return { id: id(f), ...data, date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date, body_markdown: body };
});
write(`${OUT}/content/articles.json`, json(articles));

// ── Madhhab: scholars, books, places ──
const fm = (dir) => listDir(dir, '.md').map((f) => ({ id: id(f), ...frontMatter(path.join(dir, f)).data }));
write(`${OUT}/content/madhhab/scholars.json`, json(fm('src/content/scholars')));
write(`${OUT}/content/madhhab/books.json`, json(fm('src/content/books')));
write(`${OUT}/content/madhhab/chains.json`, json(listDir('src/content/chains', '.json').map((f) => ({ id: id(f), ...JSON.parse(fs.readFileSync(path.join('src/content/chains', f), 'utf8')) }))));
write(`${OUT}/content/madhhab/places.json`, json(listDir('src/content/places', '.json').map((f) => ({ id: id(f), ...JSON.parse(fs.readFileSync(path.join('src/content/places', f), 'utf8')) }))));

// ── Data: niṣāb, history, Hijri calendar, settings ──
for (const f of ['nisab.json', 'nisab-history.json', 'hijri-months.json', 'ask-settings.json']) {
  if (fs.existsSync(`src/data/${f}`)) fs.copyFileSync(`src/data/${f}`, (mk(`${OUT}/data`), `${OUT}/data/${f}`));
}
const hist = JSON.parse(fs.readFileSync('src/data/nisab-history.json', 'utf8'));
const rows = Array.isArray(hist) ? hist : hist.entries ?? Object.values(hist);
if (rows.length) {
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  write(`${OUT}/data/nisab-history.csv`, [keys.join(','), ...rows.map((r) => keys.map((k) => r[k] ?? '').join(','))].join('\n'));
}
fs.copyFileSync('src/data/site.ts', `${OUT}/data/site-settings.ts.txt`);

// ── Static page texts (the main content of each built page, as HTML) ──
const skip = (u) => u.startsWith('/fatawa/') || u.startsWith('/madhhab/scholars/') && u.split('/').length > 4 && !u.includes('rasulullah') || u.startsWith('/madhhab/books/') && u.split('/').length > 4 || u.startsWith('/admin');
for (const u of urls.filter((u) => !skip(u))) {
  const file = path.join('dist', u, u.endsWith('/') ? 'index.html' : '');
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1];
  if (!main) continue;
  const clean = main.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/ data-astro-cid-[a-z0-9]+(="")?/g, '').trim();
  const name = u === '/' ? 'home' : u.replace(/^\/|\/$/g, '').replace(/\//g, '__').replace(/\.html$/, '');
  write(`${OUT}/pages/${name}.html`, `<!-- Main content of ${u} as of the last export. -->\n${clean}`);
}

// ── Assets ──
mk(`${OUT}/assets`);
for (const f of fs.readdirSync('public')) {
  const p = path.join('public', f);
  if (fs.statSync(p).isFile() && /\.(svg|png|jpe?g|webp|ico|pdf)$/i.test(f)) fs.copyFileSync(p, `${OUT}/assets/${f}`);
}
if (fs.existsSync('public/uploads')) fs.cpSync('public/uploads', `${OUT}/assets/uploads`, { recursive: true });

// ── Logic: the parts of the site that calculate or update things, as reference for a rebuild ──
for (const f of ['scripts/update-nisab.mjs', 'scripts/update-hilal.mjs', 'src/pages/nisab/calculator.astro', 'src/pages/nisab.astro', 'src/data/madhhab.ts', 'src/plugins/fatwa-sections.mjs', 'src/data/markdown.ts', 'src/styles/global.css']) {
  if (fs.existsSync(f)) { mk(`${OUT}/logic`); fs.copyFileSync(f, `${OUT}/logic/${path.basename(f)}.txt`); }
}

// ── URL list (for redirects when moving to a new site) ──
write(`${OUT}/urls.csv`, ['url,type,id', ...urls.filter((u) => !u.startsWith('/admin')).map((u) => {
  const f = fatawa.find((x) => x.url === u);
  return `${u},${f ? 'fatwa' : 'page'},${f ? f.id : ''}`;
})].join('\n'));

console.log(`Portable archive: ${fatawa.length} fatāwā, ${articles.length} articles, ${urls.length} URLs.`);
