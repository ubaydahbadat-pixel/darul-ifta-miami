# Darul Iftāʾ Miami — working notes

Not published on the site. Read before drafting, formatting or publishing any fatwa.

## Safeguards: Claude's role (set by the Mufti — these override everything else)

Claude is **supplementary support for professional standards only.**

- **Never answer a fatwa question,** draft a ruling, short answer, explanation or ḥikmah, or suggest what the answer might be.
- **Never explain references** or say how a source is relevant. The Mufti submits references and himself explains how they apply; Claude places and formats them.
- **Never correct or suggest readings** for source texts (see Reference text conventions).
- **Do:** format, check completeness and consistency, and **flag potential problems in the process** (missing citations, missing full texts, placeholders left in, privacy, citation details, unfinished pages, and the like). Flags describe the problem; they do not propose fiqh content.
- Text Claude has written for a fatwa page (e.g. a draft question wording or placeholders) must be clearly identified to the Mufti as Claude's, and replaced by his own before publication.

## Monthly check: American Fiqh Academy

- The Mufti wants our fatāwā in line with the resolutions of the American Fiqh Academy (https://www.fiqhacademy.com/resolutions), quoting them where needed.
- On the 1st of each month (and for any new fatwa on a subject they cover), check every fatwa — and the Niṣāb page — against the full resolutions list. Record the results in `reviews/fiqh-academy-check.md`.
- Claude lists which resolution touches which fatwa, quoting the resolution's own words, date and link. Claude does not judge agreement or draft wording; the Mufti decides whether to quote, cite or revise.

## Scope of this process

- This process is for the **public fatwa bank** only: making written fatāwā accessible, available and quick to publish.
- Submissions that involve **private user data or urgency are handled in a separate, independent process** — never through this site's pipeline.
- Normal flow per fatwa: the Mufti sends the text and one or two source/citation submissions; Claude assembles the page to the template, runs the checks, flags problems, and publishes on his go-ahead.

## Fatwa methodology (Mufti Ubaydah Badat)

Every fatwa is formulated from the juristic principles (uṣūl) as presented by **Imām al-Qudūrī**, then worked down through the later layers in a ṭabaqāt method. This is not the ṭabaqāt of Ibn Kamāl Pāshā; it follows the approach of *Iqtisab al-Hajj* (title as given by the Mufti — confirm the exact name before citing it anywhere).

1. **Starting point: al-Qudūrī.** He organised and formulated the madhhab after al-Ṭaḥāwī and al-Jaṣṣāṣ. Whether one calls it the Iraqi recension or otherwise, it is the closest understanding of Abū Ḥanīfah, so it is where every answer begins. (*Mukhtaṣar al-Qudūrī*; *Sharḥ Mukhtaṣar al-Karkhī*.)
2. **Next layer:** al-Qudūrī's students and the commentaries on the *Mukhtaṣar*; al-Marghīnānī, author of *al-Hidāyah*. Laterally on the same level: al-Sarakhsī's *al-Mabsūṭ* and al-Kāsānī's *Badāʾiʿ al-Ṣanāʾiʿ* — possibly a different recension in minor details, but clear on the juristic principle and how the rulings operate.
3. **Then:** the commentaries on *al-Hidāyah* and similar works.
4. **In ʿibādāt,** anything cited beyond these layers is essentially gloss.

**Exception — matters developed later.** Where a matter is not purely ʿibādah, or was only worked out after the main early period (4th–5th century AH onwards) and became clearer over time, the later works carry the analysis. Examples:
- *Bayʿ al-wafāʾ* — articulated mainly in the 7th–8th centuries AH (most such cases are economic rather than social).
- *ʿIshāʾ* in regions where its sign (the disappearance of twilight / onset of night) is not observed — an act of worship that falls under this exception.

## How this maps onto a fatwa page

- **Explanation = numbered sections ("nodes")**, one per part of the question (e.g. 1. the basis of the ruling, 2. the specific case, 3. a further detail of the case). Within each node, sources follow the layers: al-Qudūrī first, then the next layer, then later works as support.
- **No Arabic text in the Explanation** — it is for the general reader. Name sources in English transliteration; all Arabic/Urdu texts go in References.
- **Names:** ʿAbdullāh is written as one word (also Abū ʿAbdullāh), never ʿAbd Allāh. Full diacritics; classical scholars get their death date on first mention in a fatwa, e.g. Imām al-Qudūrī (d. 428 AH). Contemporary authors get no date. The Mufti confirms each date.
- **References:** ordered the same way, primary first. Each source is one item in the `references` list; numbering is automatic.

## Reference text conventions

- Include the **full text** of every source used — a sentence or an entire bāb. Whenever a supplementary source gives an explanation or interpretation, include it in its entirety.
- Keep the text exactly as the Mufti sends it. Never correct it, silently or otherwise.
- **Primary texts (e.g. *Mukhtaṣar al-Qudūrī*): do not suggest corrections at all.** The text has many recensions (roughly 19–25), and judging a reading needs a master copy and someone who has studied them. The Mufti will supply a master copy of al-Qudūrī (PDF and Unicode); until then, work with the text as given.
- Arabic and Urdu are detected per paragraph automatically. Set the reference's `language` to Urdu for the label.
- Arabic quoted inside an Urdu sentence: put it in square brackets `[ … ]` so it shows in Arabic script in place (fī mā bayna al-suṭūr). The Urdu author's own references in round brackets stay as they are.
- Page markers (`ص618 – …`) and editor's footnotes (`(١) …`, `= …`) are kept, each on its own line; they are styled automatically.
- Strip WhatsApp timestamps (`[10/21, 5:44 AM] Name:`) from pasted text.
- Before publishing, check every source named in the Explanation has its full text in References.

## Reviews

- Audit checklists for each fatwa live in `reviews/` (not published). Check the relevant file before editing a fatwa, and tick items off as the Mufti resolves them.

## Site

- Astro, deployed by Cloudflare from `main` on push.
- Each fatwa is one file in `src/content/fatawa/` (flat, no subfolders), with every section as its own front-matter field: `category, topic, title, date, draft, question, short_answer, explanation[{heading, text}], hikmah, references[{source, language, text}]`. The Mufti fills these in via the **/admin** form (Sveltia CMS, `public/admin/config.yml`); new entries are drafts by default.
- **User-friendly names:** categories and topics are written plain English first, Arabic term in brackets — e.g. Fasting (Ṣawm), Making Up Missed Fasts (Qaḍāʾ). The menu item "Fatāwā" stays as is. Topic links use the bracketed term.
- Categories (11) live in both `src/data/categories.ts` and `public/admin/config.yml` — keep them identical.
- Niṣāb: `scripts/update-nisab.mjs` runs twice daily via `.github/workflows/nisab.yml` (09–11 and 21–23 UTC; updates once per slot, from 5 am and from 5 pm New York). Spot prices from Swissquote, backup gold-api.com; refuses >25% daily moves. Writes `src/data/nisab.json` — never edit that file by hand.
- Niṣāb history: the 5 am figures are logged daily in `src/data/nisab-history.json`; days before 22 Oct 2026 were backfilled from COMEX gold/silver futures daily closes (`scripts/backfill-nisab.mjs`, one-off). The Niṣāb page (/nisab/) has: Niṣāb of Gold and Silver, a Zakāh Calculator heading linking to /nisab/calculator/, and Niṣāb of Ṣadaqat al-Fiṭr. The calculator page holds the zakāh-date lookup, the calculator and the chart. Calculator (Mufti, 26 Oct 2026): kept simple; gold niṣāb only; gold/silver by grams at that date's price or in dollars; accessible shares and investments only; anything else (other business assets, crypto, missed years) → Ask. The field wording and notes are Claude's, built from his instructions.
- Hijri calendar: the Mufti uses the **Central Hilal Committee of North America** (hilalcommittee.org). `scripts/update-hilal.mjs` reads their monthly announcements daily (`.github/workflows/hilal.yml`) into `src/data/hijri-months.json`. Months it cannot read can be added to that file by hand (it never removes entries); missing months show as "estimated" on the site.
- Honorifics: raḥimahullāh for the imāms on public pages.
- Ask page (28 Oct 2026, from Asif's feedback): email optional; questions with no email can only be answered publicly in the fatwa bank. Turnaround line is set by the Mufti in /admin → Ask Page Settings (`src/data/ask-settings.json`) and hidden while empty. Private one-to-one anonymous answers were not built: they would cross the scope rule above.
- Madhhab section (28 Oct 2026): /admin forms Madhhab: Scholars, Books, Places (`src/content/scholars|books|places`), built into `src/data/madhhab.ts`. Teacher/student and influenced-by/influenced links count both ways; books written and author death dates are derived. /madhhab/interactive/ has the map (Leaflet + OpenStreetMap) and connections network (vis-network). New entries are drafts. Claude adds no scholar or book content itself; the starter places are coordinates only.
- Portable archive (28 Oct 2026): `portable/` holds all content in framework-free formats for a future non-Astro rebuild. The site never reads it. Regenerated weekly by `.github/workflows/portable.yml` (`scripts/export-portable.mjs`); only `portable/README.md` is hand-written — update it when a feature is added.
