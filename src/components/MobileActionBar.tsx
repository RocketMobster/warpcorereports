import React from 'react';

type MobileActionBarProps = {
  onOpenControls: () => void;
  onOpenCrew: () => void;
  onEditCharts: () => void;
  onOpenStardate: () => void;
  onOpenHelp: () => void;
};

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = "", ...rest }) => (
  <button
    {...rest}
    className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] tracking-wide uppercase font-medium rounded-md active:scale-[0.97] transition ${className}`}
  >
    {children}
  </button>
);

export default function MobileActionBar({ onOpenControls, onOpenCrew, onEditCharts, onOpenStardate, onOpenHelp }: MobileActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 px-3 pb-3 pt-2 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent">
      <div className="grid grid-cols-5 gap-2">
        <Btn
          onClick={onOpenControls}
          title="Produce Report"
          className="bg-amber-500 hover:bg-amber-400 text-black border border-amber-400"
        >
          <span>Produce</span>
        </Btn>
        <Btn
          onClick={onOpenCrew}
          title="Reroll Current Report"
          className="bg-purple-500 hover:bg-purple-400 text-black border border-purple-400"
        >
          <span>Reroll</span>
        </Btn>
        <Btn
          onClick={onEditCharts}
          title="Edit Charts"
          className="bg-rose-500 hover:bg-rose-400 text-black border border-rose-400"
        >
          <span>Edit</span>
        </Btn>
        <Btn
          onClick={onOpenStardate}
          title="Export options"
          className="bg-blue-600 hover:bg-blue-500 text-white border border-blue-500"
        >
          <span>Export</span>
        </Btn>
        <Btn onClick={onOpenHelp} title="Help" className="bg-slate-800/80 backdrop-blur border border-slate-600 hover:bg-slate-700">
          Help
        </Btn>
      </div>
    </div>
  );
}
