import React, { useEffect, useRef, useState } from 'react';

interface CollapsibleProps {
  id: string;
  title: string;
  defaultOpen?: boolean;
  persistKey?: string; // localStorage key to persist state
  children: React.ReactNode;
}

const Collapsible: React.FC<CollapsibleProps> = ({ id, title, defaultOpen = false, persistKey, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<string | number>(open ? 'auto' : 0);

  // Load persisted state
  useEffect(() => {
    if (!persistKey) return;
    try {
      const raw = localStorage.getItem(persistKey);
      if (raw === '1') setOpen(true);
      else if (raw === '0') setOpen(false);
    } catch {}
  }, [persistKey]);

  // Persist state
  useEffect(() => {
    if (!persistKey) return;
    try { localStorage.setItem(persistKey, open ? '1' : '0'); } catch {}
  }, [open, persistKey]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (open) {
      const scrollHeight = el.scrollHeight;
      setHeight(scrollHeight);
      const timeout = setTimeout(() => setHeight('auto'), 250);
      // Observe content size changes while open
      let ro: ResizeObserver | null = null;
      if ('ResizeObserver' in window) {
        ro = new ResizeObserver(() => {
          if (contentRef.current) {
            const h = contentRef.current.scrollHeight;
            if (height !== 'auto') setHeight(h);
          }
        });
        ro.observe(el);
      }
      return () => { clearTimeout(timeout); ro?.disconnect(); };
    } else {
      setHeight(el.scrollHeight); // set current height first for transition
      requestAnimationFrame(() => setHeight(0));
    }
  }, [open, children]);

  const toggle = () => setOpen(o => !o);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  };

  return (
    <div className="border border-slate-700 rounded-lg bg-[#101826]">
      <button
        id={`${id}-header`}
        className="w-full flex items-center justify-between px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-expanded={open}
        aria-controls={`${id}-content`}
        onClick={toggle}
        onKeyDown={onKey}
        type="button"
      >
        <span className="font-semibold text-amber-300 text-sm tracking-wide">{title}</span>
        <span className="text-slate-400 text-xs ml-3">{open ? '−' : '+'}</span>
      </button>
      <div
        id={`${id}-content`}
        role="region"
        aria-labelledby={`${id}-header`}
        ref={contentRef}
        style={{ height, overflow: 'hidden' }}
        className="px-4 transition-[height] duration-200 ease-in-out motion-reduce:transition-none"
      >
        <div className="py-3 pb-4 border-t border-slate-700 text-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Collapsible;