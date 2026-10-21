// Sets Arabic and Urdu text right-to-left in the right font, and styles page markers and footnotes.
// Used when rendering every fatwa field. Runs when the site is built.

const RTL_SCRIPT = /^[\s"“«(\[]*[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;

// Letters used in Urdu but never in Arabic (ٹ ڈ ڑ ں ے ۓ ہ ۂ ی ک گ چ پ ژ).
const URDU_ONLY = /[ٹڈڑںےۓہۂیکگچپژ]/g;
// Letters used in Arabic but not in Urdu spelling (ي ك ة ه).
const ARABIC_ONLY = /[يكةه]/g;

const text = (node) =>
  node.type === 'text' ? node.value : (node.children || []).map(text).join('');

function detectLang(s) {
  const ur = (s.match(URDU_ONLY) || []).length;
  const ar = (s.match(ARABIC_ONLY) || []).length;
  if (ur === 0 && ar === 0) return null;
  return ur >= ar ? 'ur' : 'ar';
}

// Inside Urdu text, Arabic quoted in square brackets [ ... ] is shown in Arabic script, in place (fī mā bayna al-suṭūr).
const INLINE_AR = /\[([^\[\]]+)\]/g;
function markInlineArabic(node) {
  if (!node.children) return;
  const out = [];
  for (const c of node.children) {
    if (c.type !== 'text') { markInlineArabic(c); out.push(c); continue; }
    let last = 0;
    for (const m of c.value.matchAll(INLINE_AR)) {
      if (m.index > last) out.push({ type: 'text', value: c.value.slice(last, m.index) });
      out.push({
        type: 'element', tagName: 'span', properties: { lang: 'ar', className: ['ar-inline'] },
        children: [{ type: 'text', value: `[${m[1]}]` }],
      });
      last = m.index + m[0].length;
    }
    if (last < c.value.length) out.push({ type: 'text', value: c.value.slice(last) });
  }
  node.children = out;
}

function markRtl(node, fallback) {
  if (node.type !== 'element' && node.type !== 'root') return;
  if (node.type === 'element' && ['p', 'li', 'blockquote'].includes(node.tagName) && RTL_SCRIPT.test(text(node))) {
    const t = text(node).trim();
    // Each paragraph is checked on its own, so Urdu and Arabic paragraphs in one source never mix.
    const lang = detectLang(t) || fallback;
    const classes = [lang === 'ur' ? 'ur-text' : 'ar-text'];
    // Page markers (e.g. "ص618 – باب السهو") and editor's footnotes ("(١) …" or "= …") get a quieter style.
    if (/^ص\s*[0-9٠-٩]/.test(t)) classes.push('ref-page');
    else if (/^(\([0-9٠-٩]+\)|=)/.test(t)) classes.push('ref-note');
    node.properties = { ...node.properties, dir: 'rtl', lang, className: classes };
    if (lang === 'ur') markInlineArabic(node);
    return;
  }
  (node.children || []).forEach((c) => markRtl(c, fallback));
}

/** Rehype plugin. Option `fallback`: 'ar' or 'ur', used when a paragraph has no telltale letters. */
export default function rehypeRtl(options = {}) {
  const fallback = options.fallback || 'ar';
  return (tree) => markRtl(tree, fallback);
}
