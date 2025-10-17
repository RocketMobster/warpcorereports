import React, { useEffect, useRef } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: 'left' | 'right' | 'bottom';
  children: React.ReactNode;
  widthClass?: string; // tailwind width (default w-80 for side drawers)
}

export const Drawer: React.FC<DrawerProps> = ({ open, onClose, title, side = 'right', children, widthClass }) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const prevActive = useRef<Element | null>(null);

  useEffect(() => {
    if (open) {
      prevActive.current = document.activeElement;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      focusables && focusables[0]?.focus();
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (!focusables || focusables.length === 0) return;
          const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    } else if (prevActive.current instanceof HTMLElement) {
      (prevActive.current as HTMLElement).focus();
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const horizontal = side === 'left' || side === 'right';
  const translateClasses = {
    left: 'translate-x-0',
    right: 'translate-x-0',
    bottom: 'translate-y-0'
  };
  const basePos = side === 'bottom' ? 'inset-x-0 bottom-0' : side === 'left' ? 'left-0 top-0 h-full' : 'right-0 top-0 h-full';
  const dimension = side === 'bottom' ? 'h-[65vh]' : (widthClass || 'w-80');

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm motion-reduce:backdrop-blur-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={`absolute ${basePos} ${dimension} bg-[#101425] border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-fadeIn motion-reduce:animate-none pb-[max(env(safe-area-inset-bottom),0px)]`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/80">
          <h3 className="text-sm font-semibold tracking-wide text-amber-300">{title || 'Panel'}</h3>
          <button onClick={onClose} className="lcars-btn text-xs" aria-label="Close panel">Close</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;