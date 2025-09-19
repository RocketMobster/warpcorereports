import React, { useRef, useEffect } from 'react';

interface MoreMenuProps {
  open: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  actions: Array<{ label: string; onClick: ()=>void; disabled?: boolean; accent?: boolean }>;  
  densityCompact: boolean;
  onToggleDensity: (v:boolean)=>void;
  persistZoom?: boolean;
  onTogglePersistZoom?: (v:boolean)=>void;
}

export default function MoreMenu({ open, anchorRect, onClose, actions, densityCompact, onToggleDensity, persistZoom, onTogglePersistZoom }: MoreMenuProps) {
  const ref = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{
    if(!open) return;
    const handler = (e: MouseEvent) => {
      if(ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const esc = (e: KeyboardEvent) => { if(e.key==='Escape') onClose(); };
    window.addEventListener('mousedown', handler);
    window.addEventListener('keydown', esc);
    return ()=>{ window.removeEventListener('mousedown', handler); window.removeEventListener('keydown', esc); };
  }, [open, onClose]);

  if(!open) return null;
  const style: React.CSSProperties = anchorRect ? {
    position: 'absolute',
    top: anchorRect.bottom + 8 + window.scrollY,
    left: Math.min(anchorRect.left, window.innerWidth - 260) + window.scrollX,
    width: 250,
    zIndex: 50
  } : { display: 'none' };

  return (
    <div ref={ref} style={style} className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-3 space-y-3 animate-fadeIn">
      <div className="text-xs uppercase tracking-wider text-amber-300 font-semibold px-1">Report Actions</div>
      <div className="flex flex-col gap-2">
        {actions.map(a => (
          <button
            key={a.label}
            onClick={()=>{ a.onClick(); onClose(); }}
            disabled={a.disabled}
            className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${a.accent ? 'bg-amber-600 text-black border-amber-500 hover:bg-amber-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'} disabled:opacity-40 disabled:cursor-not-allowed`}
          >{a.label}</button>
        ))}
      </div>
      <div className="h-px bg-slate-700" />
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={densityCompact} onChange={e=>onToggleDensity(e.target.checked)} />
          <span className="uppercase tracking-wide">Compact Density</span>
        </label>
        {typeof persistZoom === 'boolean' && onTogglePersistZoom && (
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={persistZoom} onChange={e=>onTogglePersistZoom(e.target.checked)} />
            <span className="uppercase tracking-wide">Persist Zoom</span>
          </label>
        )}
      </div>
      <div className="h-px bg-slate-700" />
      <div className="text-[10px] leading-snug text-slate-400 px-1">Exports and settings have moved here for a cleaner main bar.</div>
    </div>
  );
}
