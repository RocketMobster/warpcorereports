import React, { useState, useEffect } from "react";
import { Report, Figure } from "../types";
import FigureView from "./FigureView";

interface ReportPreviewProps {
  report: Report;
  onReportUpdate?: (updatedReport: Report) => void;
  editEnabled?: boolean;
}

export default function ReportPreview({ report, onReportUpdate, editEnabled = false }: ReportPreviewProps) {
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
        <div className="text-xs text-slate-400">Stardate {currentReport.header.stardate} · {currentReport.header.vessel}</div>
        <div className="font-bold text-xl mb-1">{currentReport.header.title}</div>
        <div className="text-base font-semibold text-amber-400 mb-1">To: {currentReport.header.toRecipient}</div>
        <div className="text-base font-semibold text-amber-300 mb-2">CC: {currentReport.header.ccRecipient}</div>
        <div className="text-sm">Prepared By: {currentReport.header.preparedBy.rank} {currentReport.header.preparedBy.name}, Engineering</div>
      </div>
      <div className="p-6 space-y-6 bg-[#0f1426]">
        <section>
          <h3 className="text-lg font-semibold mb-1">Abstract</h3>
          <p className="text-slate-200 text-sm leading-relaxed">{currentReport.abstract}</p>
        </section>

        {(() => {
          // Create a counter for sequential figure numbering
          let figureCounter = 1;
          
          return currentReport.problems.map(p => {
            const figs = (currentReport.figures||[]).filter(f=>f.sectionAnchor===p.id);
            return (
              <section key={p.id} className="space-y-2">
                <h4 className="text-base font-bold text-amber-300">{p.id.toUpperCase()}: {p.title}</h4>
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
          <h3 className="text-lg font-semibold mb-1">Conclusion</h3>
          <p className="text-slate-200 text-sm leading-relaxed">{currentReport.conclusion}</p>
        </section>

        {!!(currentReport.crewManifest && currentReport.crewManifest.length) && (
          <section>
            <h3 className="text-lg font-semibold mb-1">Crew Manifest (Mentioned)</h3>
            <ul className="list-disc ml-6 text-sm text-slate-200">
              {currentReport.crewManifest!.map((cm, idx)=> <li key={idx}>{cm.rank} {cm.name}, {cm.role}</li>)}
            </ul>
          </section>
        )}

        <section>
          <h3 className="text-lg font-semibold mb-2">References</h3>
          <ol className="list-decimal ml-6 text-sm text-slate-200 space-y-1">
            {currentReport.references.map(r=> <li key={r.id}>{r.text}</li>)}
          </ol>
        </section>
      </div>
    </div>
  );
}
