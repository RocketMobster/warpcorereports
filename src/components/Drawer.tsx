import React, { ReactNode, useEffect } from 'react';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: 'left' | 'right' | 'bottom';
  children: ReactNode;
};

export default function Drawer({ open, onClose, title, side = 'bottom', children }: DrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-40 pointer-events-none ${open ? '' : 'invisible'}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'} pointer-events-auto`}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`absolute pointer-events-auto flex flex-col bg-slate-900 border-t border-slate-700 shadow-xl w-full max-h-[80%] ${
          side === 'bottom' ? 'left-0 bottom-0 rounded-t-xl' : ''
        } transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-4 w-1.5 rounded-full" style={{ background: '#FFB300' }} />
            <span className="font-semibold text-sm tracking-wide">{title}</span>
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
