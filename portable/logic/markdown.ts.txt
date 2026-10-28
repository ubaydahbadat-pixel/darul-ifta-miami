import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import rehypeRtl from '../plugins/fatwa-sections.mjs';

// One renderer per fallback language, created once and reused.
const processors: Record<string, ReturnType<typeof createMarkdownProcessor>> = {};

function processor(fallback: 'ar' | 'ur' | 'fa') {
  processors[fallback] ??= createMarkdownProcessor({
    syntaxHighlight: false,
    rehypePlugins: [[rehypeRtl, fallback === 'fa' ? { fallback: 'ar', force: 'fa' } : { fallback }]],
  });
  return processors[fallback];
}

/** Renders a fatwa field (Markdown text) to HTML, with Arabic/Urdu handling. */
export async function md(source: string | undefined, fallback: 'ar' | 'ur' | 'fa' = 'ar') {
  if (!source || !source.trim()) return '';
  const { code } = await (await processor(fallback)).render(source);
  return code;
}

/**
 * Prepares a pasted reference text: each line becomes its own paragraph (no blank lines needed),
 * and WhatsApp timestamps such as "[10/21, 5:44 AM] Name:" are removed.
 */
export function refText(source: string | undefined) {
  if (!source) return '';
  return source
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*\[\d{1,2}\/\d{1,2}(\/\d{2,4})?,\s*\d{1,2}:\d{2}[\s  ]*([AaPp][Mm])?\]\s*[^:]{1,60}:\s*/, '').trim())
    .filter(Boolean)
    .join('\n\n');
}
