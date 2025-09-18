import React, { useState, useEffect, useRef } from "react";
import { Report, Figure } from "../types";
import FigureView from "./FigureView";

interface ReportPreviewProps {
  report: Report;
  onReportUpdate?: (updatedReport: Report) => void;
  editEnabled?: boolean;
  onCopyHeaderLine?: () => void;
  onCopyAbstract?: () => void;
  onCopyProblems?: () => void;
  onCopyConclusion?: () => void;
  onCopyReferences?: () => void;
  onCopyProblemItem?: (index: number) => void;
  onCopyCrewManifest?: () => void;
  missionTemplate?: "none" | "incident" | "survey";
}

export default function ReportPreview({ report, onReportUpdate, editEnabled = false, onCopyHeaderLine, onCopyAbstract, onCopyProblems, onCopyConclusion, onCopyReferences, onCopyProblemItem, onCopyCrewManifest, missionTemplate = "none" }: ReportPreviewProps) {
  // Create a local copy of the report to track changes
  const [currentReport, setCurrentReport] = useState<Report>(report);
  const containerRef = useRef<HTMLDivElement|null>(null);
  // Chart base scale (80/90/100%)
  const [chartBaseScale, setChartBaseScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('wcr_chart_base_scale');
      const v = saved ? parseFloat(saved) : 1.0;
      if (!isFinite(v)) return 1.0;
      return v === 0.8 || v === 0.9 ? v : 1.0;
    } catch { return 1.0; }
  });
  useEffect(()=>{ try { localStorage.setItem('wcr_chart_base_scale', String(chartBaseScale)); } catch {} ; try { window.dispatchEvent(new Event('resize')); setTimeout(()=>{ try { window.dispatchEvent(new Event('resize')); } catch {} },16); } catch {} }, [chartBaseScale]);
  // Text zoom (0.8 - 1.4, text-only scaling architecture)
  const [zoom, setZoom] = useState<number>(() => {
    try { const saved = localStorage.getItem('previewZoom'); const val = saved ? parseFloat(saved) : 1.0; return Math.min(1.4, Math.max(0.8, isFinite(val)?val:1.0)); } catch { return 1.0; }
  });
  useEffect(()=>{ try { localStorage.setItem('previewZoom', String(zoom)); } catch {}; try { window.dispatchEvent(new Event('resize')); setTimeout(()=>{ try { window.dispatchEvent(new Event('resize')); } catch {} },16); } catch {} }, [zoom]);
  const decZoom = () => setZoom(z=> Math.max(0.8, Math.round((z-0.1)*10)/10));
  const incZoom = () => setZoom(z=> Math.min(1.4, Math.round((z+0.1)*10)/10));
  const resetZoom = () => setZoom(1.0);
  // Safe zone (restored logic – moderate version)
  const safeZonePx = (() => {
    const extra = zoom > 1 ? Math.ceil((zoom - 1) * 10) * 6 : 0;
    let base = 8 + extra;
    if (zoom >= 1.3 && Math.abs(chartBaseScale - 1.0) < 0.001) base += 8;
    return Math.min(48, Math.max(0, base));
  })();
  
  // Update local state when the report prop changes
  useEffect(() => {
    console.log("ReportPreview received new report with seed:", report.originalSeed);
    setCurrentReport(report);
  }, [report]);

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
  className="rounded-2xl border border-slate-700"
      style={{ marginRight: Math.min(14, Math.max(0, safeZonePx + 4)) }}
    >
      <div className="px-6 py-4 bg-[#12182c] border-b border-slate-700 sticky top-0 z-10" style={{ paddingRight: Math.max(0, safeZonePx + 4) }}>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400 flex-1">Stardate {currentReport.header.stardate} · {currentReport.header.vessel}</div>
          {onCopyHeaderLine && (
            <button
              className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={onCopyHeaderLine}
              title="Copy full header (Stardate, Title, To, CC, Prepared By)"
              aria-label="Copy full header"
            >
              Copy Header
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mb-1">
          <div className="font-bold text-xl">{currentReport.header.title}</div>
          {missionTemplate && missionTemplate !== 'none' && (
            <span className="text-xs px-2 py-1 rounded-md border border-amber-500 text-amber-300 bg-[#1a1f33]">Template: {missionTemplate === 'incident' ? 'Incident' : 'Survey'}</span>
          )}
        </div>
        <div className="text-base font-semibold text-amber-400 mb-1">To: {currentReport.header.toRecipient}</div>
        <div className="text-base font-semibold text-amber-300 mb-2">CC: {currentReport.header.ccRecipient}</div>
        <div className="text-sm">Prepared By: {currentReport.header.preparedBy.rank} {currentReport.header.preparedBy.name}, Engineering</div>
        {/* Zoom & chart size controls (inverse scaled) */}
        <div className="controls-no-zoom mt-3 select-none" style={{ ['--zoom' as any]: String(zoom), paddingRight: Math.max(0, safeZonePx + 4) }}>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="opacity-80 whitespace-nowrap">Chart size:</span>
            <select
              value={chartBaseScale}
              onChange={e=>setChartBaseScale(parseFloat(e.target.value))}
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
            <button type="button" onClick={decZoom} className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700" aria-label="Zoom out" title="Zoom out">-</button>
            <button type="button" onClick={resetZoom} className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700" aria-label="Reset zoom" title="Reset zoom">{Math.round(zoom * 100)}%</button>
            <button type="button" onClick={incZoom} className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700" aria-label="Zoom in" title="Zoom in">+</button>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6 bg-[#0f1426] report-zoom" style={{ ['--zoom' as any]: String(zoom) }}>
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-1">Abstract</h3>
            {onCopyAbstract && (
              <button
                className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={onCopyAbstract}
                title="Copy abstract"
                aria-label="Copy abstract"
              >
                Copy Abstract
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
                className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={onCopyProblems}
                title="Copy all problems"
                aria-label="Copy all problems"
              >
                Copy Problems
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
                      className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={()=>onCopyProblemItem(idx)}
                      title="Copy this problem"
                      aria-label="Copy this problem"
                    >
                      Copy
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-200">{p.summary}</p>
                {figs.length>0 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {figs.map(f => {
                      const sequentialFig = {...f, displayId: `Figure ${figureCounter++}`};
                      return (
                        <div key={f.id} className="chart-no-zoom" style={{ ['--zoom' as any]: String(zoom) }}>
                          <FigureView
                            fig={sequentialFig}
                            onFigureUpdate={handleFigureUpdate}
                            editEnabled={editEnabled}
                            safeZonePx={safeZonePx}
                            zoomScale={zoom}
                            baseScale={chartBaseScale}
                          />
                        </div>
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
                className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={onCopyConclusion}
                title="Copy conclusion"
                aria-label="Copy conclusion"
              >
                Copy Conclusion
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
                  className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={onCopyCrewManifest}
                  title="Copy crew manifest"
                  aria-label="Copy crew manifest"
                >
                  Copy Crew
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
                className="text-xs px-2 py-1 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={onCopyReferences}
                title="Copy references"
                aria-label="Copy references"
              >
                Copy References
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
