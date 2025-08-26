import React, { useMemo, useState, useEffect } from "react";
import LCARSChart from "./LCARSChart";
import ChartEditor from "./ChartEditor";
import { Figure } from "../types";
import { LCARS } from "../utils/lcars";

interface FigureViewProps {
  fig: Figure;
  onFigureUpdate?: (updatedFigure: Figure) => void;
  editEnabled?: boolean;
}

export default function FigureView({ fig, onFigureUpdate, editEnabled = false }: FigureViewProps) {
  const [currentFigure, setCurrentFigure] = useState<Figure>(fig);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const accent = LCARS.accents[(fig.index ?? 0) % LCARS.accents.length];
  
  // Update local state when the figure prop changes
  useEffect(() => {
    setCurrentFigure(fig);
  }, [fig]);

  // Handle figure update from the editor
  const handleFigureUpdate = (updatedFigure: Figure) => {
    setCurrentFigure(updatedFigure);
    
    // If parent provided an update handler, call it
    if (onFigureUpdate) {
      onFigureUpdate(updatedFigure);
    }
  };

  return (
    <div className="figure-container rounded-2xl p-4 border border-slate-700 bg-[#101425] relative group">
      <div className="text-sm text-slate-300 mb-2 font-semibold">
        {currentFigure.displayId || currentFigure.id}. {currentFigure.title}
      </div>
      
      <div className="h-48">
        <LCARSChart figure={currentFigure} />
      </div>
      
      <div className="text-xs text-slate-400 mt-2 italic">
        {currentFigure.caption} {currentFigure.sectionAnchor ? `(Ref: ${currentFigure.sectionAnchor})` : ""}
      </div>
      
      {editEnabled && (
        <button 
          className="absolute top-2 right-2 bg-amber-500 text-black p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditorOpen(true)}
          title="Edit Chart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
          </svg>
        </button>
      )}
      
      {isEditorOpen && (
        <ChartEditor 
          figure={currentFigure} 
          onUpdate={handleFigureUpdate} 
          onClose={() => setIsEditorOpen(false)} 
        />
      )}
    </div>
  );
}
