// Turns certain "## Heading" sections of a fatwa into tap-to-open dropdowns,
// and sets Arabic paragraphs right-to-left. Runs when the site is built.

const DROPDOWNS = ['explanation', 'ḥikmah', 'hikmah', 'references'];
const ARABIC = /^[\s"“«(]*[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;

const text = (node) =>
  node.type === 'text' ? node.value : (node.children || []).map(text).join('');

function markArabic(node) {
  if (node.type !== 'element') return;
  if (['p', 'li', 'blockquote'].includes(node.tagName) && ARABIC.test(text(node))) {
    node.properties = { ...node.properties, dir: 'rtl', lang: 'ar', className: ['ar-text'] };
  }
  (node.children || []).forEach(markArabic);
}

export default function fatwaSections() {
  return (tree) => {
    tree.children.forEach(markArabic);
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
