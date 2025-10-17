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
  textOnlyZoom?: boolean;
  zoomScale?: number;
  baseScale?: number;
}

export default function FigureView({ fig, onFigureUpdate, editEnabled = false, safeZonePx = 0, textOnlyZoom = false, zoomScale = 1, baseScale = 1 }: FigureViewProps) {
  const [currentFigure, setCurrentFigure] = useState<Figure>(fig);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement|null>(null);
  const chartRef = useRef<HTMLDivElement|null>(null);
  const [chartWidth, setChartWidth] = useState<number>(0);
  const initialWidthRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);
  const [adaptivePad, setAdaptivePad] = useState(0);
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

  // Lazy-render chart when visible
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (isVisible) return; // already visible
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin: "200px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [containerRef, isVisible]);

  // Measure chart container width for responsive SVG
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const update = () => {
      const w = Math.max(0, Math.floor(el.clientWidth));
      setChartWidth(w);
      if (w > 0) {
        if (initialWidthRef.current == null) initialWidthRef.current = w;
        else initialWidthRef.current = Math.max(initialWidthRef.current, w);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [chartRef]);

  if (initialZoomRef.current == null) initialZoomRef.current = zoomScale || 1;

  // Adaptive measurement: once visible and after layout/zoom changes, detect if title/caption are too close to right edge
  useEffect(() => {
    if (!isVisible) return; // wait until chart is rendered
    // Only attempt when at higher zoom or full base scale scenarios where clipping risk is higher
    const z = zoomScale || 1;
    if (adaptivePad >= 8) return; // cap
    // Defer to next frame to allow render/DOM updates
    const id = requestAnimationFrame(() => {
      const titleEl = titleRef.current;
      const capEl = captionRef.current;
      const candidates: HTMLElement[] = [];
      if (titleEl) candidates.push(titleEl);
      if (capEl) candidates.push(capEl);
      let need = false;
      for (const el of candidates) {
        // scrollWidth > clientWidth -> actual overflow
        if (el.scrollWidth - el.clientWidth > 0) { need = true; break; }
        // measure remaining space by approximating last line right boundary
        // We approximate: if (clientWidth - (scrollWidth)) < threshold (when scrollWidth is not that different) the browser is barely fitting content.
        const delta = el.clientWidth - el.scrollWidth; // usually >=0 when no overflow
        if (delta >= 0 && delta < 6) { need = true; break; }
      }
      if (need) {
        setAdaptivePad(prev => (prev < 4 ? 4 : prev < 8 ? 8 : prev));
      }
    });
    return () => cancelAnimationFrame(id);
  }, [isVisible, zoomScale, baseScale, currentFigure.title, currentFigure.caption, adaptivePad]);

  const highZoom = (zoomScale || 1) >= 1.3;
  const extraContainerRightPad = highZoom ? 2 : 0; // slight shift inward to expose right border stroke

  return (
    <div ref={containerRef} className={`figure-container rounded-2xl p-4 border bg-[#101425] relative group ${
      editEnabled 
        ? 'border-purple-500 shadow-md transition-all duration-300 animate-pulse-border' 
        : 'border-slate-700'
    }`} style={extraContainerRightPad ? { paddingRight: `calc(1rem + ${extraContainerRightPad}px)` } : undefined}>
      <div
        ref={titleRef}
        className="text-sm text-slate-300 mb-2 font-semibold pr-1 break-words"
        style={{ paddingRight: Math.max(0, Math.round(((safeZonePx as number) || 0) + 4 + adaptivePad)) }}
      >
        {currentFigure.displayId || currentFigure.id}. {currentFigure.title}
      </div>
      
      {(() => {
        const lockNoZoom = textOnlyZoom || (zoomScale || 1) > 1;
        return (
          <div
            ref={chartRef}
            className={`w-full flex ${lockNoZoom ? 'items-start justify-start' : 'items-center justify-center'}`}
            style={lockNoZoom ? ({ height: `${192 / (zoomScale || 1)}px` } as React.CSSProperties) : { height: '192px' }}
          >
        {isVisible ? (
          <div
            className={lockNoZoom ? 'chart-no-zoom' : ''}
            style={lockNoZoom ? ({ ['--zoom' as any]: String(zoomScale) } as React.CSSProperties) : undefined}
          >
            {(() => {
              // Measure baseline width in visual pixels (post-transform) via BCR.
              const baselineWidth = chartWidth;
              const baseScaleClamped = Math.min(1, Math.max(0.5, (baseScale || 1)));
              const firstWidth = initialWidthRef.current ?? baselineWidth;
              const baseWidth = Math.max(200, firstWidth || baselineWidth || 300);
              const w = Math.max(200, Math.round(baseWidth * baseScaleClamped));
              let rightSafe = Math.max(20, Math.round((safeZonePx || 0)));
              // Additional internal cushion at high zoom when charts are full-size.
              if ((zoomScale || 1) >= 1.3 && Math.abs((baseScale || 1) - 1) < 0.001) {
                rightSafe += 10; // primary extra breathing room
                if ((zoomScale || 1) >= 1.35) {
                  rightSafe += 2; // micro bump to clear rare descender clipping
                }
                // Transitional boost: if we started below threshold and crossed into high zoom, add a one-time extra margin
                if ((initialZoomRef.current || 1) < 1.3) {
                  rightSafe += 4; // helps match persisted-high-zoom wrap scenario
                }
              }
              return <LCARSChart figure={currentFigure} width={w} height={192} rightSafe={rightSafe + adaptivePad} />;
            })()}
          </div>
        ) : (
          <div className="w-full h-full rounded-xl bg-slate-800/60 border border-slate-700 animate-pulse" aria-label="Chart loading placeholder" />
        )}
          </div>
        );
      })()}
      
      <div
        ref={captionRef}
        className="text-xs text-slate-400 mt-2 italic break-words"
        style={{ paddingRight: Math.max(0, Math.round(((safeZonePx as number) || 0) + 4 + adaptivePad)) }}
      >
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

// Add adaptive measurement inside component (cannot be outside). Reopen component scope via patch append not possible here; instead integrate effect above return.
