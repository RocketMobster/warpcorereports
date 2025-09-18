import React, { ReactNode, useState } from 'react';

type CollapsibleProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export default function Collapsible({ title, defaultOpen = false, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-700 rounded-md">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-left bg-slate-800 hover:bg-slate-700"
        aria-expanded={open}
      >
        <span className="font-medium text-sm">{title}</span>
        <span className="text-xs opacity-70">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="p-3 text-sm space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}
