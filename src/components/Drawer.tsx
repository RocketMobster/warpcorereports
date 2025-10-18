import React, { ReactNode, useEffect } from 'react';

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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none invisible'}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'} pointer-events-auto z-40`}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`absolute pointer-events-auto flex flex-col ${panelClassName ?? 'bg-slate-900'} border-t ${headerClassName ?? 'border-slate-700'} shadow-xl w-full max-h-[80%] z-50 ${
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
            type="button"
            onClick={onClose}
            className="lcars-btn"
            aria-label="Close"
          >Close</button>
        </div>
        <div className="overflow-y-auto p-4 text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
