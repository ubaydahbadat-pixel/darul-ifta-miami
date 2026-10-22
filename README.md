# Darul Iftāʾ Miami

The website of Darul Iftāʾ Miami, built with Astro and hosted on Cloudflare Pages.

## Posting a new fatwa

Use the submission form at **/admin** on the site (for example `https://darul-ifta-miami.ubaydahbadat.workers.dev/admin/`).

**First time only — make a sign-in token:**
1. On GitHub: **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Name it "Darul Ifta form", set an expiry, and under **Repository access** choose **Only select repositories → darul-ifta-miami**.
3. Under **Permissions → Repository permissions**, set **Contents** to **Read and write**.
4. Generate it and copy it. On /admin choose **Sign In Using Access Token** and paste it. Keep the token private.

**Each fatwa:** Fatāwā → **New Fatwa**, fill in the fields in order, then **Save**.
- **Category**, **Topic** (same spelling as before to join an existing topic), **Title** (also becomes the link).
- **Question**, **Short Answer**.
- **Explanation — Primary Ḥanafī Sources** and **Explanation — Supplementary Sources**.
- **Wisdom of the Ruling (Ḥikmah)**.
- **References**: **Add Reference** for each source — the book and page, the language, and the full text.
- **Draft** is on by default, so a new fatwa stays hidden. Switch it off and save again to publish.

Saving commits to GitHub and the site updates itself in about two minutes.

**Writing in the fields:** separate paragraphs with a blank line. Arabic and Urdu are detected per paragraph and shown right-to-left in the right script. Arabic inside an Urdu sentence goes in `[square brackets]`. Page markers (`ص618 – …`) and editor's footnotes (`(١) …`) on their own lines are styled automatically.

The fatwa appears at `/fatawa/<category>/<topic>/<title-as-link>/`.

**Categories:** Ṭahārah, Ṣalāh, Ṣawm, Zakāh, Ḥajj & ʿUmrah, Uḍḥiyah & ʿAqīqah, Muʿāmalāt, Nikāḥ & Ṭalāq, al-Ḥaẓr wa al-Ibāḥah, Inheritance, Miscellaneous. To change them, edit both `src/data/categories.ts` and `public/admin/config.yml`.

## Other things you can edit

- **Niṣāb:** updated automatically every day at 5 pm New York time by `.github/workflows/nisab.yml` (GitHub → Actions → "Daily niṣāb update" → **Run workflow** to update it immediately). Niṣāb weights (87.48 g gold, 612.36 g silver) are in `src/data/nisab.json`.
- **Ṣadaqat al-Fiṭr:** set once a year in `src/data/site.ts`
- **Menu:** `src/layouts/Base.astro`, the `menu` list near the top
- **Colours:** `src/styles/global.css`, at the top
- **About and Madhhab text:** `src/pages/about.astro`, `src/pages/madhhab/index.astro`
- **Articles:** add `.md` files to `src/content/articles/` with `title:` and `date:` at the top

## Cloudflare Pages settings

- Framework preset: **Astro**
- Build command: `npm run build`
- Output directory: `dist`
