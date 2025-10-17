import React, { useState, useEffect, useRef } from "react";
import { Report, Figure } from "../types";
import FigureView from "./FigureView";
import { elementContainsMath, renderKatexIn } from "../utils/lazyKatex";

interface ReportPreviewProps {
  report: Report;
  onReportUpdate?: (updatedReport: Report) => void;
  editEnabled?: boolean;
  compact?: boolean;
  textOnlyZoom?: boolean;
  onCopyHeaderLine?: () => void;
  onCopyAbstract?: () => void;
  onCopyProblems?: () => void;
  onCopyConclusion?: () => void;
  onCopyReferences?: () => void;
  onCopyProblemItem?: (index: number) => void;
  onCopyCrewManifest?: () => void;
  missionTemplate?: "none" | "incident" | "survey";
}

export default function ReportPreview({ report, onReportUpdate, editEnabled = false, compact = false, textOnlyZoom = false, onCopyHeaderLine, onCopyAbstract, onCopyProblems, onCopyConclusion, onCopyReferences, onCopyProblemItem, onCopyCrewManifest, missionTemplate = "none" }: ReportPreviewProps) {
  // Create a local copy of the report to track changes
  const [currentReport, setCurrentReport] = useState<Report>(report);
  const containerRef = useRef<HTMLDivElement|null>(null);
  // Lock charts to the scale they were generated at (80/90/100)
  const [chartBaseScale, setChartBaseScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('wcr_chart_base_scale');
      const v = saved ? parseFloat(saved) : 1.0;
      if (!isFinite(v)) return 1.0;
      return v === 0.8 || v === 0.9 ? v : 1.0;
    } catch { return 1.0; }
  });
  useEffect(() => {
    try { localStorage.setItem('wcr_chart_base_scale', String(chartBaseScale)); } catch {}
    try {
      window.dispatchEvent(new Event('resize'));
      setTimeout(() => { try { window.dispatchEvent(new Event('resize')); } catch {} }, 16);
    } catch {}
  }, [chartBaseScale]);
  const [zoom, setZoom] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("previewZoom");
      const val = saved ? parseFloat(saved) : 1.0;
      if (!isFinite(val)) return 1.0;
      return Math.min(1.4, Math.max(0.8, val));
    } catch {
      return 1.0;
    }
  });
  // Ensure charts measure correctly right after mount, regardless of initial zoom
  useEffect(() => {
    const t = setTimeout(() => {
      try { window.dispatchEvent(new Event('resize')); } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);
  
  // Update local state when the report prop changes
  useEffect(() => {
    console.log("ReportPreview received new report with seed:", report.originalSeed);
    setCurrentReport(report);
  }, [report]);

  // Lazy KaTeX rendering when content has math
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    if (!elementContainsMath(node)) return;
    renderKatexIn(node);
  }, [currentReport]);

  // Persist zoom changes
  useEffect(() => {
    try {
      localStorage.setItem("previewZoom", String(zoom));
    } catch {}
    // Force re-measure of charts after zoom changes
    try {
      window.dispatchEvent(new Event('resize'));
      // Double-tap resize to handle transform/layout async updates
      setTimeout(() => {
        try { window.dispatchEvent(new Event('resize')); } catch {}
      }, 16);
    } catch {}
  }, [zoom]);

  const decZoom = () => setZoom(z => Math.max(0.8, Math.round((z - 0.1) * 10) / 10));
  const incZoom = () => setZoom(z => Math.min(1.4, Math.round((z + 0.1) * 10) / 10));
  const resetZoom = () => setZoom(1.0);
  // Compute a zoom-scaled safe-zone in pixels (base 4px, +2px per +0.1 zoom)
  // Safe-zone: aggressively buffer right edge for high zooms to prevent clipping
  // Gentler, clamped right-edge safe zone for mobile stability
  // Base 8px + 6px per +0.1 above 1.0, max 36px
  const safeZonePx = (() => {
    const extra = zoom > 1 ? Math.ceil((zoom - 1) * 10) * 6 : 0;
    let base = 8 + extra;
    // Adaptive bump: at high zoom with full-size charts give a little more breathing room
    if (zoom >= 1.3 && Math.abs(chartBaseScale - 1.0) < 0.001) {
      base += 8; // add 8px cushion
    }
    return Math.min(48, Math.max(0, base));
  })();

  // Handle figure updates
  const handleFigureUpdate = (updatedFigure: Figure) => {
    // Create a new report with the updated figure
    const updatedReport = {
      ...currentReport,
      figures: currentReport.figures?.map(fig => 
        fig.id === updatedFigure.id ? updatedFigure : fig
      )
    };
    
    // Update local state
    setCurrentReport(updatedReport);
    
    // Notify parent if callback provided
    if (onReportUpdate) {
      onReportUpdate(updatedReport);
    }
  };

  return (
  <div
    id="printable-report"
    ref={containerRef}
    className="rounded-2xl border border-slate-700 overflow-hidden"
    style={{ marginRight: Math.min(14, Math.max(0, safeZonePx + 4)) }}
  >
  <div className={`bg-[#12182c] border-b border-slate-700 sticky top-0 z-10 ${compact ? 'px-3 py-2' : 'px-3 md:px-6 py-3 md:py-4'}`}
    style={{ paddingRight: Math.max(0, safeZonePx + 4) }}>
  <div className="flex items-center gap-2" style={{ paddingRight: Math.max(0, safeZonePx + 4) }}>
          <div className="text-xs text-slate-400 flex-1">Stardate {currentReport.header.stardate} · {currentReport.header.vessel}</div>
          {onCopyHeaderLine && (
            <button
              className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 inline-flex items-center gap-1"
              onClick={onCopyHeaderLine}
              title="Copy full header (Stardate, Title, To, CC, Prepared By)"
              aria-label="Copy full header"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M10 1.5A1.5 1.5 0 0 1 11.5 3v7A1.5 1.5 0 0 1 10 11.5H5A1.5 1.5 0 0 1 3.5 10V3A1.5 1.5 0 0 1 5 1.5h5z"/><path d="M12.5 3A2.5 2.5 0 0 0 10 0.5H5A2.5 2.5 0 0 0 2.5 3v7A2.5 2.5 0 0 0 5 12.5h5A2.5 2.5 0 0 0 12.5 10V3z"/><path d="M13 4.5H14a2 2 0 0 1 2 2v6A2 2 0 0 1 14 14.5H9a2 2 0 0 1-2-2V11h1v1.5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H13v-1z"/></svg>
              <span className="hidden md:inline">Copy Header</span>
            </button>
          )}
        </div>
  <div className="flex items-center gap-3 mb-1" style={{ paddingRight: Math.max(0, safeZonePx + 4) }}>
          <div className="font-bold text-xl">{currentReport.header.title}</div>
          {missionTemplate && missionTemplate !== 'none' && (
            <span className="text-xs px-2 py-1 rounded-md border border-amber-500 text-amber-300 bg-[#1a1f33]">Template: {missionTemplate === 'incident' ? 'Incident' : 'Survey'}</span>
          )}
        </div>
        <div className="text-base font-semibold text-amber-400 mb-1">To: {currentReport.header.toRecipient}</div>
        <div className="text-base font-semibold text-amber-300 mb-2">CC: {currentReport.header.ccRecipient}</div>
    <div className="text-sm">Prepared By: {currentReport.header.preparedBy.rank} {currentReport.header.preparedBy.name}, Engineering</div>
      </div>
  <div className={`${compact ? 'p-4 space-y-4' : 'p-6 space-y-6'} bg-[#0f1426] report-zoom`} style={{ ['--zoom' as any]: String(zoom) }}>
        {/* Controls: text zoom and chart size (inverse scaled to remain stable) */}
        <div
          className="controls-no-zoom -mt-1 mb-2 select-none"
          style={{ ['--zoom' as any]: String(zoom), paddingRight: Math.max(0, safeZonePx + 4) }}
        >
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="opacity-80 whitespace-nowrap">Chart size:</span>
            <select
              value={chartBaseScale}
              onChange={e => setChartBaseScale(parseFloat(e.target.value))}
              className="bg-slate-900 border border-slate-600 rounded px-1.5 py-0.5 text-xs"
              aria-label="Chart base size"
              title="Chart base size"
            >
              <option value={0.8}>80%</option>
              <option value={0.9}>90%</option>
              <option value={1.0}>100%</option>
            </select>
          </div>
          <div className="flex items-center gap-1" aria-label="Preview zoom controls">
            <button
              type="button"
              onClick={decZoom}
              className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700"
              aria-label="Zoom out"
              title="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700"
              aria-label="Reset zoom"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={incZoom}
              className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700"
              aria-label="Zoom in"
              title="Zoom in"
            >
              +
            </button>
          </div>
        </div>
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-1">Abstract</h3>
            {onCopyAbstract && (
              <button
                className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 inline-flex items-center gap-1"
                onClick={onCopyAbstract}
                title="Copy abstract"
                aria-label="Copy abstract"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5A1.5 1.5 0 0 0 2.5 3v10A1.5 1.5 0 0 0 4 14.5h8A1.5 1.5 0 0 0 13.5 13V6.707A1 1 0 0 0 13.207 6L9.5 2.293A1 1 0 0 0 8.793 2H4z"/><path d="M9.5 2.293V5.5a1 1 0 0 0 1 1h3.207"/></svg>
                <span className="hidden md:inline">Copy Abstract</span>
              </button>
            )}
          </div>
          <p className="text-slate-200 text-sm leading-relaxed">{currentReport.abstract}</p>
        </section>

        {currentReport.problems?.length ? (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-1">Problems</h3>
            {onCopyProblems && (
              <button
                className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 inline-flex items-center gap-1"
                onClick={onCopyProblems}
                title="Copy all problems"
                aria-label="Copy all problems"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5A1.5 1.5 0 0 0 2.5 3v10A1.5 1.5 0 0 0 4 14.5h8A1.5 1.5 0 0 0 13.5 13V6.707A1 1 0 0 0 13.207 6L9.5 2.293A1 1 0 0 0 8.793 2H4z"/><path d="M9.5 2.293V5.5a1 1 0 0 0 1 1h3.207"/></svg>
                <span className="hidden md:inline">Copy Problems</span>
              </button>
            )}
          </div>
        ) : null}

        {(() => {
          // Create a counter for sequential figure numbering
          let figureCounter = 1;
          
          return currentReport.problems.map((p, idx) => {
            const figs = (currentReport.figures||[]).filter(f=>f.sectionAnchor===p.id);
            return (
              <section key={p.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-amber-300">{p.id.toUpperCase()}: {p.title}</h4>
                  {onCopyProblemItem && (
                    <button
                      className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 inline-flex items-center gap-1"
                      onClick={()=>onCopyProblemItem(idx)}
                      title="Copy this problem"
                      aria-label="Copy this problem"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M10 1.5A1.5 1.5 0 0 1 11.5 3v7A1.5 1.5 0 0 1 10 11.5H5A1.5 1.5 0 0 1 3.5 10V3A1.5 1.5 0 0 1 5 1.5h5z"/><path d="M12.5 3A2.5 2.5 0 0 0 10 0.5H5A2.5 2.5 0 0 0 2.5 3v7A2.5 2.5 0 0 0 5 12.5h5A2.5 2.5 0 0 0 12.5 10V3z"/><path d="M13 4.5H14a2 2 0 0 1 2 2v6A2 2 0 0 1 14 14.5H9a2 2 0 0 1-2-2V11h1v1.5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H13v-1z"/></svg>
                      <span className="hidden md:inline">Copy</span>
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-200">{p.summary}</p>
                {figs.length>0 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {figs.map(f => {
                      // Create a copy of the figure with sequential ID
                      const sequentialFig = {...f, displayId: `Figure ${figureCounter++}`};
                      return (
                        <FigureView 
                          key={f.id} 
                          fig={sequentialFig} 
                          onFigureUpdate={handleFigureUpdate}
                          editEnabled={editEnabled}
                          safeZonePx={safeZonePx}
                          textOnlyZoom={textOnlyZoom}
                          zoomScale={zoom}
                          baseScale={chartBaseScale}
                        />
                      );
                    })}
                  </div>
                )}
              </section>
            );
          });
        })()}

        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-1">Conclusion</h3>
            {onCopyConclusion && (
              <button
                className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 inline-flex items-center gap-1"
                onClick={onCopyConclusion}
                title="Copy conclusion"
                aria-label="Copy conclusion"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5A1.5 1.5 0 0 0 2.5 3v10A1.5 1.5 0 0 0 4 14.5h8A1.5 1.5 0 0 0 13.5 13V6.707A1 1 0 0 0 13.207 6L9.5 2.293A1 1 0 0 0 8.793 2H4z"/><path d="M9.5 2.293V5.5a1 1 0 0 0 1 1h3.207"/></svg>
                <span className="hidden md:inline">Copy Conclusion</span>
              </button>
            )}
          </div>
          <p className="text-slate-200 text-sm leading-relaxed">{currentReport.conclusion}</p>
        </section>

        {!!(currentReport.crewManifest && currentReport.crewManifest.length) && (
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold mb-1">Crew Manifest (Mentioned)</h3>
              {onCopyCrewManifest && (
                <button
                  className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 inline-flex items-center gap-1"
                  onClick={onCopyCrewManifest}
                  title="Copy crew manifest"
                  aria-label="Copy crew manifest"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M10 1.5A1.5 1.5 0 0 1 11.5 3v7A1.5 1.5 0 0 1 10 11.5H5A1.5 1.5 0 0 1 3.5 10V3A1.5 1.5 0 0 1 5 1.5h5z"/><path d="M12.5 3A2.5 2.5 0 0 0 10 0.5H5A2.5 2.5 0 0 0 2.5 3v7A2.5 2.5 0 0 0 5 12.5h5A2.5 2.5 0 0 0 12.5 10V3z"/><path d="M13 4.5H14a2 2 0 0 1 2 2v6A2 2 0 0 1 14 14.5H9a2 2 0 0 1-2-2V11h1v1.5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H13v-1z"/></svg>
                  <span className="hidden md:inline">Copy Crew</span>
                </button>
              )}
            </div>
            <ul className="list-disc ml-6 text-sm text-slate-200">
              {currentReport.crewManifest!.map((cm, idx)=> <li key={idx}>{cm.rank} {cm.name}, {cm.role}</li>)}
            </ul>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-2">References</h3>
            {onCopyReferences && (
              <button
                className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 inline-flex items-center gap-1"
                onClick={onCopyReferences}
                title="Copy references"
                aria-label="Copy references"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5A1.5 1.5 0 0 0 2.5 3v10A1.5 1.5 0 0 0 4 14.5h8A1.5 1.5 0 0 0 13.5 13V6.707A1 1 0 0 0 13.207 6L9.5 2.293A1 1 0 0 0 8.793 2H4z"/><path d="M9.5 2.293V5.5a1 1 0 0 0 1 1h3.207"/></svg>
                <span className="hidden md:inline">Copy References</span>
              </button>
            )}
          </div>
          <ol className="list-decimal ml-6 text-sm text-slate-200 space-y-1">
            {currentReport.references.map(r=> <li key={r.id}>{r.text}</li>)}
          </ol>
        </section>
      </div>
    </div>
  );
}
