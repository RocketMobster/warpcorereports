import { useState, useEffect } from 'react';

export default function useMediaQuery(query: string) {
  const getMatch = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  };
  const [matches, setMatches] = useState<boolean>(getMatch);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    // Older Safari support
    if (mql.addEventListener) mql.addEventListener('change', handler); else mql.addListener(handler);
    setMatches(mql.matches);
    return () => { if (mql.removeEventListener) mql.removeEventListener('change', handler); else mql.removeListener(handler); };
  }, [query]);

  return matches;
}
