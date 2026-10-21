import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import rehypeRtl from '../plugins/fatwa-sections.mjs';

// One renderer per fallback language, created once and reused.
const processors: Record<string, ReturnType<typeof createMarkdownProcessor>> = {};

function processor(fallback: 'ar' | 'ur') {
  processors[fallback] ??= createMarkdownProcessor({
    syntaxHighlight: false,
    rehypePlugins: [[rehypeRtl, { fallback }]],
  });
  return processors[fallback];
}

/** Renders a fatwa field (Markdown text) to HTML, with Arabic/Urdu handling. */
export async function md(source: string | undefined, fallback: 'ar' | 'ur' = 'ar') {
  if (!source || !source.trim()) return '';
  const { code } = await (await processor(fallback)).render(source);
  return code;
}
