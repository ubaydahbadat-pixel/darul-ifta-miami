// The eight fatwa categories, in the order of the fiqh books.
// `id` is what you write in a fatwa's `category:` line and what appears in the link.
export const categories = [
  { id: 'taharah', name: 'Ṭahārah', blurb: 'Wuḍūʾ, ghusl, tayammum and purity' },
  { id: 'salah', name: 'Ṣalāh', blurb: 'Prayer, Jumuʿah, Janāzah and travel' },
  { id: 'sawm', name: 'Ṣawm', blurb: 'Ramaḍān, qaḍāʾ and voluntary fasts' },
  { id: 'zakah', name: 'Zakāh', blurb: 'Zakāh, Ṣadaqat al-Fiṭr and charity' },
  { id: 'hajj-umrah', name: 'Ḥajj & ʿUmrah', blurb: 'Iḥrām, rites and travel' },
  { id: 'udhiyah', name: 'Uḍḥiyah & ʿAqīqah', blurb: 'Sacrifice and the newborn' },
  { id: 'muamalat', name: 'Muʿāmalāt', blurb: 'Business, finance and contracts' },
  { id: 'nikah', name: 'Nikāḥ & Family', blurb: 'Marriage, divorce and inheritance' },
] as const;

export const categoryIds = categories.map((c) => c.id) as [string, ...string[]];

export function categoryName(id: string) {
  return categories.find((c) => c.id === id)?.name ?? id;
}

// Turns "Sajdah al-Sahw" into "sajdah-al-sahw" (diacritics removed) for links.
export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ʿʾ'’‘]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
