# Darul Iftāʾ Miami — portable content archive

Everything on the website, in plain formats, for rebuilding the site without Astro (for example by a
professional developer, in plain HTML/CSS or another framework).

**The live site does not read anything in this folder.** It is a copy kept on the side.
It is regenerated automatically every Sunday (and can be run by hand from GitHub → Actions →
"Portable content archive") by `scripts/export-portable.mjs`. Only this README is written by hand;
everything else is overwritten on each run, so do not edit those files here: edit the site's content in /admin.

## What is where

| Path | What it holds |
|---|---|
| `content/fatawa/<id>.json` | Each fatwa, every field: category, topic, title, date, draft, question, short_answer, explanation (numbered sections), hikmah, references (source, language, full text). Drafts are included and marked `"draft": true`. |
| `content/fatawa-readable/<id>.md` | The same fatwa as one readable document. |
| `content/categories.json` | The 11 categories, in order, with names and blurbs. |
| `content/articles.json` | Articles (Markdown body). |
| `content/madhhab/` | Scholars, books and places (with coordinates) for the Madhhab section and its two maps. Links between entries use each entry's `id`. |
| `data/nisab.json` | The latest gold and silver prices and niṣāb figures. |
| `data/nisab-history.json` / `.csv` | The 5 am New York niṣāb figures, daily from 1 March 2024. Rows marked `backfill` came from COMEX futures daily closes. |
| `data/hijri-months.json` | Start dates of the Hijri months, per the Central Hilal Committee of North America. |
| `data/ask-settings.json`, `data/site-settings.ts.txt` | Ask page turnaround; form key, donation details, Ṣadaqat al-Fiṭr, WhatsApp link. |
| `pages/*.html` | The main content of every other page (About, Madhhab, Niṣāb, Ask, etc.) as HTML, as of the last export. |
| `logic/*.txt` | Copies of the code that calculates or updates things (see below), for reference. |
| `assets/` | Logo and uploaded files. |
| `urls.csv` | Every current web address. Keep these addresses on a new site, or redirect them, so existing links keep working. |

## Features a new site must rebuild

- **Fatwa pages:** Fatāwā → category → topic → fatwa. The Explanation is numbered sections; References are numbered, each with its full text.
- **Arabic, Urdu and Persian text** (`logic/fatwa-sections.mjs.txt`, `logic/markdown.ts.txt`): language detected per paragraph and set right-to-left with the right font (Amiri for Arabic, Noto Nastaliq Urdu for Urdu). Arabic in [square brackets] inside Urdu shows in Arabic script. Page markers (`ص618 – …`) and editor's footnotes (`(١) …`) are styled separately. WhatsApp timestamps are stripped. Every non-Arabic reference shows its language.
- **Niṣāb** (`logic/update-nisab.mjs.txt`): spot prices fetched twice daily (from 5 am and 5 pm New York); gold niṣāb 87.48 g, silver niṣāb 612.36 g; rejects daily moves over 25%.
- **Zakāh calculator** (`logic/calculator.astro.txt`): zakāh-date lookup on the Hilal Committee calendar, calculator on the gold niṣāb only, and the niṣāb-over-time chart.
- **Hijri calendar** (`logic/update-hilal.mjs.txt`): reads the Central Hilal Committee's monthly announcements; months it cannot find are shown as "estimated".
- **Mahr** on the Niṣāb page: minimum mahr, Mahr Fāṭimī and Mahr al-Azwāj from their weights in silver (1 dirham = 3.0618 g), with footnote citations.
- **Madhhab** (`logic/madhhab.ts.txt`): scholar and book pages, a map of places, and a connections network (teacher → student, author → book, recension → book, base book → commentary/abridgement/gloss, book → book). A base book lists the works written on it, grouped by type; on the network, more than 6 of one type are shown as one summary box. Each link counts in both directions.
- **Ask and Contact forms** (Web3Forms). On Ask, email is optional.
- **Colours and fonts** are in `logic/global.css.txt`.

## Standing rules that apply to any new site

The working rules for fatwa pages (methodology order, references in full and never corrected, naming and
dates, privacy) are in `CLAUDE.md` at the top of the repository. They are not tied to Astro.
