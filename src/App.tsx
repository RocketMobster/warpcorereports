import React, { useState, useEffect } from "react";
// @ts-ignore
import { Canvg } from "canvg";
import ReportControls from "./components/ReportControls";
import ReportPreview from "./components/ReportPreview";
import CrewManifestPanel from "./components/CrewManifestPanel";
import ShareDialog from "./components/ShareDialog";
import { generateReport, reportToTxt, generateCrewManifest } from "./utils/reportGen";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import { Report, GeneratorConfig } from "./types";
import { buildDocx } from "./utils/docxExport";
import { randint } from "./utils/helpers";
import { parseSharedReportUrl, decodeSharedReportId } from "./utils/urlParser";
import "./utils/print.css";

export default function App() {
  const [report, setReport] = useState<Report | null>(null);
  const [crewManifest, setCrewManifest] = useState<any[]>([]);
  const [lastCfg, setLastCfg] = useState<any | null>(null);
  const [config, setConfig] = useState<GeneratorConfig | null>(null);
  const [manifestPanelOpen, setManifestPanelOpen] = useState(false);
  const [currentCrewCount, setCurrentCrewCount] = useState(0);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isSharedLink, setIsSharedLink] = useState(false);
  const [sharedLinkFormat, setSharedLinkFormat] = useState<"pdf" | "docx" | "txt" | undefined>(undefined);

  // Check if we're opening a shared report link
  useEffect(() => {
    const { reportId, format } = parseSharedReportUrl();
    
    if (reportId) {
      // Mark that we're viewing a shared link
      setIsSharedLink(true);
      
      // Store the format if specified
      if (format) {
        setSharedLinkFormat(format as "pdf" | "docx" | "txt");
      }
      
      // Try to decode the report ID
      const reportInfo = decodeSharedReportId(reportId);
      
      if (reportInfo) {
        console.log("Decoded shared report info:", reportInfo);
        
        // Generate a consistent seed from the reportId to ensure the same report is generated
        const seedFromReportId = reportInfo.originalSeed || reportId;
        
        // Generate a report based on the decoded information
        const cfg: GeneratorConfig = {
          problemsCount: reportInfo.problemCount || 3,
          graphsEnabled: true,
          graphsCount: 3,
          signatoryName: reportInfo.preparedBy || "Shared Report Viewer",
          signatoryRank: "Lieutenant",
          vessel: reportInfo.vessel || "USS Enterprise",
          stardate: reportInfo.stardate,
          problemDetailLevel: 3,
          humorLevel: reportInfo.humorLevel || 5,
          figureBias: reportInfo.figureBias || "auto",
          seed: seedFromReportId // Use the original seed if available, otherwise use the reportId
        };
        
        // Generate a report with these parameters
        handleGenerate(cfg);
        
        // If a format was specified, open that format automatically
        if (format) {
          setTimeout(() => {
            switch (format) {
              case "pdf":
                exportPdf();
                break;
              case "docx":
                exportDocx();
                break;
              case "txt":
                exportTxt();
                break;
            }
          }, 1000);
        }
      }
    }
  }, []);

  // Helper to generate random crew size
  const getRandomCrewSize = () => randint(3, 10, Math.random);

  const handleGenerate = (cfg: GeneratorConfig) => {
    const r = generateReport({ ...cfg, crewManifest, problemDetailLevel: cfg.problemDetailLevel });
    setReport(r);
    setConfig(cfg);
    setLastCfg(cfg);
  };

  // Update both crew manifest and report when crew changes
  const handleCrewChange = (crew: any[]) => {
    setCrewManifest(crew);
    if (config) {
      const r = generateReport({ ...config, crewManifest: crew });
      setReport(r);
    }
  };

  // Toggle crew manifest panel and update crew/report if opening
  const handlePreviewCrewToggle = (count?: number, seed?: string) => {
    setManifestPanelOpen(open => {
      if (!open) {
        // Generate a random crew size if not provided
        const crewCount = count ?? getRandomCrewSize();
        // Update the current crew count - CrewManifestPanel will react
        setCurrentCrewCount(crewCount);
        return true;
      }
      return false;
    });
  };

  // Regenerate crew manifest with random size
  const regenerateCrewManifest = () => {
    // Generate a new random crew size between 2 and 10
    const crewCount = getRandomCrewSize();
    // Update the current crew count
    setCurrentCrewCount(crewCount);
    // Let the CrewManifestPanel handle the generation via its effect
  };

  const exportTxt = () => {
    if (!report) return;
    const txt = reportToTxt(report);
    const blob = new Blob([txt], { type: "text/plain" });
    saveAs(blob, "engineering_report.txt");
  };

  const exportPdf = async () => {
    if (!report) return;
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    let yPos = 48;
    const actions: Array<() => Promise<void>> = [];

    actions.push(async () => {
      doc.setFontSize(18);
      doc.text(report.header.title, 48, yPos);
      yPos += 32;
    });
    actions.push(async () => {
      doc.setFontSize(12);
      doc.text(`Stardate: ${report.header.stardate}`, 48, yPos);
      yPos += 20;
      doc.text(`Vessel: ${report.header.vessel}`, 48, yPos);
      yPos += 20;
      doc.text(`Prepared By: ${report.header.preparedBy.rank} ${report.header.preparedBy.name}, Engineering`, 48, yPos);
      yPos += 20;
      doc.text(`Submitted To: ${report.header.submittedTo}`, 48, yPos);
      yPos += 20;
    });
    actions.push(async () => {
      doc.setFontSize(14);
      doc.text("Abstract", 48, yPos);
      yPos += 20;
      doc.setFontSize(10);
      const abstractLines = doc.splitTextToSize(report.abstract, 500);
      doc.text(abstractLines, 48, yPos);
      yPos += abstractLines.length * 12;
    });
    if (report.problems) {
      // Create a counter for sequential figure numbering
      let figureCounter = 1;
      
      report.problems.forEach((p, i) => {
        actions.push(async () => {
          yPos += 30;
          doc.setFontSize(14);
          if (yPos > 700) { doc.addPage(); yPos = 48; }
          doc.text(`Problem ${i+1}: ${p.title}`, 48, yPos);
          yPos += 20;
          doc.setFontSize(10);
          const problemLines = doc.splitTextToSize(p.summary, 500);
          if (yPos + problemLines.length * 12 > 700) { doc.addPage(); yPos = 48; }
          doc.text(problemLines, 48, yPos);
          yPos += problemLines.length * 12;
        });
        const figs = (report.figures || []).filter(f => f.sectionAnchor === p.id);
        if (figs.length) {
          actions.push(async () => {
            yPos += 20;
            if (yPos > 700) { doc.addPage(); yPos = 48; }
            doc.text("Figures:", 48, yPos);
          });
          figs.forEach(f => {
            // Create a figure number for the PDF
            const figureNumber = `Figure ${figureCounter++}`;
            
            actions.push(async () => {
              yPos += 15;
              const captionText = `- ${figureNumber}: ${f.title} — ${f.caption}`;
              const captionLines = doc.splitTextToSize(captionText, 420);
              if (yPos + captionLines.length * 12 > 700) { doc.addPage(); yPos = 48; }
              doc.text(captionLines, 60, yPos);
              yPos += captionLines.length * 12;
              const svgElem = document.getElementById(f.id);
              let width = 320, height = 180;
              if (svgElem && svgElem instanceof SVGSVGElement) {
                try {
                  const svgString = new XMLSerializer().serializeToString(svgElem);
                  if (svgElem.viewBox && svgElem.viewBox.baseVal) {
                    width = svgElem.viewBox.baseVal.width || width;
                    height = svgElem.viewBox.baseVal.height || height;
                  } else if (svgElem.width && svgElem.height) {
                    width = Number(svgElem.width.baseVal.value) || width;
                    height = Number(svgElem.height.baseVal.value) || height;
                  }
                  const canvas = document.createElement("canvas");
                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext("2d");
                  if (ctx) {
                    const v = await Canvg.fromString(ctx, svgString);
                    await v.render();
                    const pngData = canvas.toDataURL("image/png");
                    if (yPos + height + 10 > 700) { doc.addPage(); yPos = 48; }
                    doc.addImage(pngData, "PNG", 60, yPos + 10, width, height);
                    yPos += height + 10;
                  } else {
                    yPos += height + 10;
                    doc.setTextColor(255, 179, 0); // Amber color
                    doc.text("⚠️ Chart unavailable - Contact the author", 60, yPos);
                  }
                } catch (e) {
                  yPos += 30;
                  doc.text("[Chart unavailable]", 60, yPos);
                }
              } else {
                yPos += 30;
                doc.text("[Chart unavailable]", 60, yPos);
              }
            });
          });
        }
      });
    }
    actions.push(async () => {
      yPos += 30;
      doc.setFontSize(14);
      doc.text("Conclusion", 48, yPos);
      yPos += 20;
      doc.setFontSize(10);
      const conclusionLines = doc.splitTextToSize(report.conclusion, 500);
      doc.text(conclusionLines, 48, yPos);
      yPos += conclusionLines.length * 12;
    });
    if (report.crewManifest && report.crewManifest.length) {
      actions.push(async () => {
        yPos += 30;
        doc.setFontSize(14);
        doc.text("Crew Manifest (Mentioned)", 48, yPos);
        doc.setFontSize(10);
        report.crewManifest?.forEach(cm => {
          yPos += 15;
          doc.text(`- ${cm.rank} ${cm.name}, ${cm.role}`, 48, yPos);
        });
      });
    }
    actions.push(async () => {
      yPos += 30;
      doc.setFontSize(14);
      if (yPos > 700) { doc.addPage(); yPos = 48; }
      doc.text("References", 48, yPos);
      doc.setFontSize(10);
      report.references.forEach((r, idx) => {
        let cleanText = r.text.replace(/^\[\d+\]\s*/, "");
        const refText = `[${idx + 1}] ${cleanText}`;
        const refLines = doc.splitTextToSize(refText, 420);
        if (yPos + refLines.length * 12 > 700) { doc.addPage(); yPos = 48; }
        doc.text(refLines, 48, yPos);
        yPos += refLines.length * 12;
      });
    });
    for (const act of actions) {
      await act();
    }
    doc.save("engineering_report.pdf");
  };

  const exportDocx = async () => {
    if (!report) return;
    const doc = buildDocx(report);
    const blob = await doc;
    saveAs(blob, "engineering_report.docx");
  };

  const printReport = () => {
    if (!report) return;
    
    // We need to wait for all SVG charts to render properly
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0b0d16] text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-extrabold mb-6">Starfleet Engineering Report Generator</h1>
        
        {isSharedLink && (
          <div className="bg-blue-700 text-white p-4 rounded-lg mb-6">
            <h2 className="text-lg font-bold">⚠️ Shared Report</h2>
            <p>You are viewing a shared report for <span className="font-bold">{report?.header.vessel}</span>.</p>
            {sharedLinkFormat && (
              <p className="mt-2">
                This link requested format: <span className="font-bold">{sharedLinkFormat.toUpperCase()}</span>
              </p>
            )}
            <p className="text-xs mt-2 text-blue-200">
              Shared reports use a consistent seed to ensure the same content appears when shared.
            </p>
          </div>
        )}
        
        <ReportControls
          onGenerate={handleGenerate}
          onPreviewCrew={handlePreviewCrewToggle}
          manifestPanelOpen={manifestPanelOpen}
          onRegenerate={regenerateCrewManifest}
        />
        {manifestPanelOpen && (
          <CrewManifestPanel 
            count={currentCrewCount} 
            onCrewChange={handleCrewChange} 
            onRegenerate={regenerateCrewManifest}
          />
        )}
        <div className="flex gap-3 mb-6">
          <button onClick={exportTxt} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700">Download TXT</button>
          <button onClick={exportPdf} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700">Download PDF</button>
          <button onClick={exportDocx} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700">Download DOCX</button>
          <button onClick={printReport} className="px-3 py-2 rounded-xl bg-amber-600 text-black font-bold border border-amber-500">Print Report</button>
          <button 
            onClick={() => setIsShareDialogOpen(true)} 
            className="px-3 py-2 rounded-xl bg-blue-600 text-white font-bold border border-blue-500"
            disabled={!report}
          >
            Share Report
          </button>
        </div>
        
        {report ? <ReportPreview report={report} /> : <div>No report yet.</div>}
        
        {report && (
          <ShareDialog 
            report={report} 
            isOpen={isShareDialogOpen} 
            onClose={() => setIsShareDialogOpen(false)} 
          />
        )}
      </div>
    </div>
  );
}
