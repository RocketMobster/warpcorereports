let katexLoaded: Promise<any> | null = null;

async function ensureKatex() {
  if (!katexLoaded) {
    katexLoaded = (async () => {
      const katex = await import('katex');
      // Try to load auto-render if available; fall back to manual if not
      let renderMathInElement: any = null;
      try {
        // @ts-ignore
        const mod = await import('katex/contrib/auto-render');
        renderMathInElement = mod?.default || (mod as any)?.renderMathInElement;
      } catch {}
      return { katex, renderMathInElement };
    })();
  }
  return katexLoaded;
}

export async function renderKatexIn(container: HTMLElement) {
  const mod = await ensureKatex();
  if (mod.renderMathInElement) {
    mod.renderMathInElement(container, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false
    });
  }
}

export function elementContainsMath(el: HTMLElement): boolean {
  const text = el.textContent || '';
  return /\$\$[\s\S]*\$\$|\$[^$\n]+\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/.test(text);
}
