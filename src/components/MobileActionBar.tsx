import React from 'react';

type MobileActionBarProps = {
  onOpenControls: () => void;
  onOpenCrew: () => void;
  onOpenStardate: () => void;
  onOpenHelp: () => void;
  onOpenMore: () => void;
};

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...rest }) => (
  <button
    {...rest}
    className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] tracking-wide uppercase font-medium bg-slate-800/80 backdrop-blur border border-slate-600 rounded-md hover:bg-slate-700 active:scale-[0.97] transition"
  >
    {children}
  </button>
);

export default function MobileActionBar({ onOpenControls, onOpenCrew, onOpenStardate, onOpenHelp, onOpenMore }: MobileActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 px-3 pb-3 pt-2 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent">
      <div className="grid grid-cols-5 gap-2">
        <Btn onClick={onOpenControls}>Controls</Btn>
        <Btn onClick={onOpenCrew}>Crew</Btn>
        <Btn onClick={onOpenStardate}>Stardate</Btn>
        <Btn onClick={onOpenHelp}>Help</Btn>
        <Btn onClick={onOpenMore}>More</Btn>
      </div>
    </div>
  );
}
