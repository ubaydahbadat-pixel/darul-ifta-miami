// The fatwa categories, in the order of the fiqh books. Names: plain English first, the Arabic term in brackets.
// `id` is what you write in a fatwa's `category:` line and what appears in the link.
export const categories = [
  { id: 'taharah', name: 'Purification (Ṭahārah)', blurb: 'Wuḍūʾ, ghusl, tayammum and purity' },
  { id: 'salah', name: 'Prayer (Ṣalāh)', blurb: 'Prayer, Jumuʿah, Janāzah and travel' },
  { id: 'sawm', name: 'Fasting (Ṣawm)', blurb: 'Ramaḍān, qaḍāʾ and voluntary fasts' },
  { id: 'zakah', name: 'Obligatory Charity (Zakāh)', blurb: 'Zakāh, Ṣadaqat al-Fiṭr and charity' },
  { id: 'hajj-umrah', name: 'Pilgrimage (Ḥajj & ʿUmrah)', blurb: 'Iḥrām, rites and travel' },
  { id: 'udhiyah', name: 'Uḍḥiyah/Qurbānī', blurb: 'Sacrifice' },
  { id: 'muamalat', name: 'Business & Finance (Muʿāmalāt)', blurb: 'Business, finance and contracts' },
  { id: 'nikah', name: 'Marriage & Divorce (Nikāḥ & Ṭalāq)', blurb: 'Marriage and divorce' },
  { id: 'hazr-ibahah', name: 'Permitted & Prohibited (al-Ḥaẓr wa al-Ibāḥah)', blurb: 'The permitted and the prohibited' },
  { id: 'inheritance', name: 'Inheritance (Mīrāth)', blurb: 'Mīrāth and the shares of the heirs' },
  { id: 'miscellaneous', name: 'Miscellaneous', blurb: 'Aymān, nudhūr and other matters' },
] as const;
// If you change this list, change the same list in public/admin/config.yml (the submission form).

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
