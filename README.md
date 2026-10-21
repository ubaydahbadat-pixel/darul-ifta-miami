# Darul Iftāʾ Miami

The website of Darul Iftāʾ Miami, built with Astro and hosted on Cloudflare Pages.

## Posting a new fatwa

1. On GitHub, open `src/content/fatawa/` and then the category folder (for example `salah`).
2. Select **Add file → Create new file**.
3. Name the file after the fatwa's short link, ending in `.md`. For example: `fifth-rakah-asr.md`.
4. Paste in this template, fill it from your Google Doc, and select **Commit changes**.

```
---
title: "Standing for a fifth rakʿah in ʿAṣr"
category: salah
topic: "Sajdah al-Sahw"
date: 2026-10-21
---

## Question

...

## Short Answer

...

## Explanation

### Primary Ḥanafī Sources

...

...

### Supplementary Sources

...

## Ḥikmah

...

## References

### 1. Radd al-Muḥtār, 2:85

النص العربي كاملاً...

### 2. al-Baḥr al-Rāʾiq, 2:104

النص العربي كاملاً...

### 3. Fatāwā Maḥmūdiyyah, 7:120 (Urdu)

مکمل اردو عبارت...

---

*And Allah knows best.*

**Answered by:** Mufti Ubaydah Badat
```

On the page, the Question and Short Answer always show. **Explanation**, **Ḥikmah** and **References** become tap-to-open dropdowns. Any paragraph that starts in Arabic is set right-to-left automatically.

**References standard:** give each source its own numbered `###` heading (book, volume:page), then the Arabic text underneath, as long as it needs to be. Whenever a supplementary source is used for an explanation or interpretation, include its full text.

**Arabic and Urdu:** references are Arabic by default. For an Urdu source, add `(Urdu)` at the end of its heading: the text then shows in Urdu (Nastaliq) script with an **Urdu** label, and Arabic sources get an **Arabic** label only if you add `(Arabic)`. Keep each source in one language; if a book quotes Arabic inside Urdu, split it into two numbered references.

The site rebuilds itself within a minute or two, and the fatwa appears at:
`/fatawa/<category>/<topic>/<file name>/`

**Category** must be one of: `taharah`, `salah`, `sawm`, `zakah`, `hajj-umrah`, `udhiyah`, `muamalat`, `nikah`.

**Topic** is written normally, with diacritics. Writing the same topic again files the fatwa under the existing topic. A new topic creates a new topic page automatically.

To hold a fatwa back without deleting it, add `draft: true` under the date.

To attach a PDF, upload it to `public/pdf/` and add `pdf: "/pdf/file-name.pdf"` under the date. A **Download PDF** button will appear.

## Other things you can edit

- **Niṣāb figures and Ṣadaqat al-Fiṭr:** `src/data/site.ts`
- **Menu:** `src/layouts/Base.astro`, the `menu` list near the top
- **Colours:** `src/styles/global.css`, at the top
- **Categories:** `src/data/categories.ts`
- **About and Madhhab text:** `src/pages/about.astro`, `src/pages/madhhab/index.astro`
- **Articles:** add `.md` files to `src/content/articles/` with `title:` and `date:` at the top

## Cloudflare Pages settings

- Framework preset: **Astro**
- Build command: `npm run build`
- Output directory: `dist`
