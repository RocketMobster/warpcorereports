import React, { useMemo, useState, useEffect, useRef } from "react";
import LCARSChart from "./LCARSChart";
import ChartEditor from "./ChartEditor";
import { Figure } from "../types";
import { LCARS } from "../utils/lcars";
import { playSound } from "../utils/sounds";

interface FigureViewProps {
  fig: Figure;
  onFigureUpdate?: (updatedFigure: Figure) => void;
  editEnabled?: boolean;
  safeZonePx?: number;
  zoomScale?: number;
  baseScale?: number;
  fixedWidth?: number; // externally enforced fixed pixel width for text-only zoom stability
}

export default function FigureView({ fig, onFigureUpdate, editEnabled = false, baseScale = 1, fixedWidth, zoomScale }: FigureViewProps) {
  const [currentFigure, setCurrentFigure] = useState<Figure>(fig);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const accent = LCARS.accents[(fig.index ?? 0) % LCARS.accents.length];
  const containerRef = useRef<HTMLDivElement|null>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number>(320);
  const chartOuterRef = useRef<HTMLDivElement|null>(null);
  const [offsetX, setOffsetX] = useState<number>(0); // micro-centering translation

  // Measure available width inside figure container (responsive charts)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Use ResizeObserver for responsiveness
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width; // visual width (pre-transform width compensation not applied here)
        if (w && w > 0) {
          setMeasuredWidth(w);
        }
      }
    });
    ro.observe(el);
    return () => { ro.disconnect(); };
  }, []);

  const chartPixelWidth = useMemo(() => {
    if (fixedWidth) return fixedWidth;
    const targetFull = 360;
    const raw = targetFull * baseScale;
    const effectiveMax = Math.min(measuredWidth, 400);
    return Math.round(Math.min(raw, effectiveMax));
  }, [measuredWidth, baseScale, fixedWidth]);

  const chartPixelHeight = useMemo(() => Math.round(chartPixelWidth * (180 / 320)), [chartPixelWidth]);
  
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

  // Micro-centering: measure padding asymmetry and apply tiny translateX
  useEffect(() => {
    const el = containerRef.current;
    const inner = chartOuterRef.current;
    if (!el || !inner) return;
    const apply = () => {
      try {
        const parentRect = el.getBoundingClientRect();
        const innerRect = inner.getBoundingClientRect();
        // compute horizontal leftover space inside figure container
        const leftGap = innerRect.left - parentRect.left;
        const rightGap = parentRect.right - innerRect.right;
        const diff = rightGap - leftGap; // positive means inner shifted left
        // Only adjust if imbalance > 1px; clamp to +/-3px
        if (Math.abs(diff) > 1) {
          const adjust = Math.max(-3, Math.min(3, Math.round(diff / 2))); // halve diff to move toward center
          setOffsetX(adjust);
        } else {
          setOffsetX(0);
        }
      } catch {}
    };
    apply();
    const ro = new ResizeObserver(() => apply());
    ro.observe(el);
    if (inner) ro.observe(inner);
    window.addEventListener('resize', apply);
    return () => { ro.disconnect(); window.removeEventListener('resize', apply); };
  }, [zoomScale, fixedWidth]);

  return (
    <div className={`figure-container rounded-2xl p-4 border bg-[#101425] relative group ${
      editEnabled 
        ? 'border-purple-500 shadow-md transition-all duration-300 animate-pulse-border' 
        : 'border-slate-700'
    }`}>
      <div className="text-sm text-slate-300 mb-2 font-semibold">
        {currentFigure.displayId || currentFigure.id}. {currentFigure.title}
      </div>
      
      <div ref={containerRef} className="h-48" style={{ width: '100%', position: 'relative' }}>
        <div ref={chartOuterRef} style={{ width: chartPixelWidth, margin: '0 auto', transform: offsetX ? `translateX(${offsetX}px)` : undefined }}>
          <LCARSChart figure={currentFigure} width={chartPixelWidth} height={chartPixelHeight} />
        </div>
      </div>
      
      <div className="text-xs text-slate-400 mt-2 italic">
        {currentFigure.caption} {currentFigure.sectionAnchor ? `(Ref: ${currentFigure.sectionAnchor})` : ""}
      </div>
      
      {editEnabled && (
        <button 
          className="absolute top-2 right-2 bg-amber-500 text-black p-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
          onClick={() => {
            playSound('chartEdit');
            setIsEditorOpen(true);
          }}
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
          onUpdate={(updatedFigure) => {
            handleFigureUpdate(updatedFigure);
            playSound('success');
          }} 
          onClose={() => {
            setIsEditorOpen(false);
            playSound('buttonClick');
          }} 
        />
      )}
    </div>
  );
}
