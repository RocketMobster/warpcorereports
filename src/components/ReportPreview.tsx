import React, { useState, useEffect } from "react";
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
    <div id="printable-report" className="rounded-2xl border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 bg-[#12182c] border-b border-slate-700">
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
      </div>
      <div className="p-6 space-y-6 bg-[#0f1426]">
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
                      // Create a copy of the figure with sequential ID
                      const sequentialFig = {...f, displayId: `Figure ${figureCounter++}`};
                      return (
                        <FigureView 
                          key={f.id} 
                          fig={sequentialFig} 
                          onFigureUpdate={handleFigureUpdate}
                          editEnabled={editEnabled}
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
