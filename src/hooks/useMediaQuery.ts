import { useEffect, useState } from 'react';

// Simple media query hook (client-side only). Returns false during SSR/first paint until evaluated.
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    try { mql.addEventListener('change', listener); } catch { mql.addListener(listener); }
    return () => { try { mql.removeEventListener('change', listener); } catch { mql.removeListener(listener); } };
  }, [query]);

  return matches;
}

export default useMediaQuery;