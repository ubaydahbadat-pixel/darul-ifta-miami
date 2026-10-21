// Turns certain "## Heading" sections of a fatwa into tap-to-open dropdowns,
// and sets Arabic and Urdu text right-to-left in the right font. Runs when the site is built.
//
// Language of a reference: add "(Urdu)" at the end of its ### heading. Without it, text is treated as Arabic.

const DROPDOWNS = ['explanation', 'ḥikmah', 'hikmah', 'references'];
const RTL_SCRIPT = /^[\s"“«(]*[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
const LANG_TAG = /\s*\((urdu|arabic)\)\s*$/i;

const text = (node) =>
  node.type === 'text' ? node.value : (node.children || []).map(text).join('');

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

function markRtl(node, lang) {
  if (node.type !== 'element') return;
  if (['p', 'li', 'blockquote'].includes(node.tagName) && RTL_SCRIPT.test(text(node))) {
    node.properties = { ...node.properties, dir: 'rtl', lang, className: [lang === 'ur' ? 'ur-text' : 'ar-text'] };
    if (lang === 'ur') markInlineArabic(node);
    return;
  }
  (node.children || []).forEach((c) => markRtl(c, lang));
}

// Removes "(Urdu)" / "(Arabic)" from the end of a heading and adds a small language label instead.
function takeLangTag(h) {
  const last = h.children[h.children.length - 1];
  if (!last || last.type !== 'text') return null;
  const m = last.value.match(LANG_TAG);
  if (!m) return null;
  last.value = last.value.replace(LANG_TAG, '');
  const lang = m[1].toLowerCase() === 'urdu' ? 'ur' : 'ar';
  h.children.push({
    type: 'element', tagName: 'span', properties: { className: ['lang-label'] },
    children: [{ type: 'text', value: lang === 'ur' ? 'Urdu' : 'Arabic' }],
  });
  return lang;
}

function assignLanguages(nodes) {
  let lang = 'ar';
  for (const node of nodes) {
    if (node.type === 'element' && (node.tagName === 'h2' || node.tagName === 'h3')) {
      lang = takeLangTag(node) || 'ar';
      continue;
    }
    markRtl(node, lang);
  }
}

export default function fatwaSections() {
  return (tree) => {
    assignLanguages(tree.children);
    const out = [];
    const kids = tree.children;
    for (let i = 0; i < kids.length; i++) {
      const node = kids[i];
      const heading = node.type === 'element' && node.tagName === 'h2' ? text(node).trim().toLowerCase() : '';
      const isDropdown = DROPDOWNS.includes(heading);
      const isShort = heading === 'short answer';
      if (!isDropdown && !isShort) { out.push(node); continue; }

      const body = [];
      while (i + 1 < kids.length) {
        const next = kids[i + 1];
        if (next.type === 'element' && (next.tagName === 'h2' || next.tagName === 'hr')) break;
        body.push(next); i++;
      }
      if (isShort) {
        out.push({
          type: 'element', tagName: 'section', properties: { className: ['short-answer'] },
          children: [node, ...body],
        });
        continue;
      }
      out.push({
        type: 'element', tagName: 'details', properties: { className: ['drop'] },
        children: [
          { type: 'element', tagName: 'summary', properties: {}, children: node.children },
          { type: 'element', tagName: 'div', properties: { className: ['drop-body'] }, children: body },
        ],
      });
    }
    tree.children = out;
  };
}
