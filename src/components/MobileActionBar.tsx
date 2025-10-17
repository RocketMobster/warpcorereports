import React from 'react';
import { hapticMedium, hapticLight } from "../utils/haptics";

interface MobileActionBarProps {
  hasReport: boolean;
  onProduce: () => void;
  onReroll?: () => void;
  onShare?: () => void;
  onHelp?: () => void;
  onStardate?: () => void;
  onCrew?: () => void;
  onMore?: () => void;
}

const MobileActionBar: React.FC<MobileActionBarProps> = ({ hasReport, onProduce, onReroll, onShare, onHelp, onStardate, onCrew, onMore }) => {
  return (
  <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0b0d16]/95 backdrop-blur border-t border-slate-700 px-3 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center gap-2 overflow-x-auto">
      <button
        onClick={() => { hapticMedium(); onProduce(); }}
        className="px-3 py-2 rounded-md bg-amber-500 text-black font-bold text-sm flex-shrink-0"
        aria-label="Produce Report"
      >Produce</button>
      <button
        onClick={() => { if (onReroll) { hapticLight(); onReroll(); } }}
        disabled={!hasReport}
        className={`px-3 py-2 rounded-md text-sm font-semibold flex-shrink-0 ${hasReport ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'}`}
        aria-label="Reroll Current Report"
      >Reroll</button>
      <button
        onClick={onShare}
        disabled={!hasReport}
        className={`px-3 py-2 rounded-md text-sm font-semibold flex-shrink-0 ${hasReport ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}
        aria-label="Share Report"
      >Share</button>
      <button
        onClick={() => { if (onHelp) { hapticLight(); onHelp(); } }}
        className="px-3 py-2 rounded-md bg-slate-800 border border-slate-600 text-slate-200 text-sm flex-shrink-0"
        aria-label="Help"
      >Help</button>
      <button
        onClick={() => { if (onStardate) { hapticLight(); onStardate(); } }}
        className="px-3 py-2 rounded-md bg-slate-800 border border-slate-600 text-slate-200 text-sm flex-shrink-0"
        aria-label="Stardate Calculator"
      >Stardate</button>
      <button
        onClick={() => { if (onCrew) { hapticLight(); onCrew(); } }}
        className="px-3 py-2 rounded-md bg-slate-800 border border-slate-600 text-slate-200 text-sm flex-shrink-0"
        aria-label="Crew Manifest"
      >Crew</button>
      <button
        onClick={() => { if (onMore) { hapticLight(); onMore(); } }}
        className="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-slate-200 text-sm flex-shrink-0"
        aria-label="More actions"
      >More</button>
    </div>
  );
};

export default MobileActionBar;