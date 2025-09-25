import React, { ReactNode, useEffect, useRef } from 'react';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: 'left' | 'right' | 'bottom';
  children: ReactNode;
  accentClass?: string; // rail color class
  titleClass?: string;  // title text classes
  panelClassName?: string; // panel container classes (background/border)
  headerClassName?: string; // header border/background overrides
};

export default function Drawer({ open, onClose, title, side = 'bottom', children, accentClass, titleClass, panelClassName, headerClassName }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement|null>(null);
  const previouslyFocused = useRef<HTMLElement|null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Focus management + trap
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      // announce open
      try { window.dispatchEvent(new CustomEvent('wcr-live', { detail: `${title || 'Panel'} opened` })); } catch {}
      setTimeout(() => {
        const focusable = panelRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        focusable?.focus();
      }, 0);
    } else if (previouslyFocused.current) {
      // announce close
      try { window.dispatchEvent(new CustomEvent('wcr-live', { detail: `${title || 'Panel'} closed` })); } catch {}
      previouslyFocused.current.focus();
    }
  }, [open, title]);

  useEffect(() => {
    if (!open) return;
    const node = panelRef.current;
    if (!node) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusables = Array.from(node.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled'));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    node.addEventListener('keydown', handler);
    return () => node.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div className={`fixed inset-0 z-40 pointer-events-none ${open ? '' : 'invisible'}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'} pointer-events-auto`}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={`absolute pointer-events-auto flex flex-col ${panelClassName ?? 'bg-slate-900'} border-t ${headerClassName ?? 'border-slate-700'} shadow-xl w-full max-h-[80%] ${
          side === 'bottom' ? 'left-0 bottom-0 rounded-t-xl' : ''
        } transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className={`flex items-center justify-between px-4 py-3 border-b ${headerClassName ?? 'border-slate-700'}`}>
          <div className="flex items-center gap-3">
            <div className={`h-4 w-1.5 rounded-full ${accentClass ?? ''}`} style={!accentClass ? { background: '#FFB300' } : undefined} />
            <span className={`${titleClass ?? 'font-semibold text-sm tracking-wide'}`}>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-wide px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600"
          >Close</button>
        </div>
        <div className="overflow-y-auto p-4 text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
