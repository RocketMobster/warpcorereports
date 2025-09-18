import React, { useState, useEffect } from "react";
// @ts-ignore
import { Canvg } from "canvg";
import ReportControls from "./components/ReportControls";
import StardateCalculator from "./components/StardateCalculator";
import ReportPreview from "./components/ReportPreview";
import CrewManifestPanel from "./components/CrewManifestPanel";
import ShareDialog from "./components/ShareDialog";
import SoundControls from "./components/SoundControls";
import HelpPanel from "./components/HelpPanel";
import { generateReport, reportToTxt, generateCrewManifest } from "./utils/reportGen";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import { Report, GeneratorConfig } from "./types";
import { buildDocx } from "./utils/docxExport";
import { randint } from "./utils/helpers";
import { parseSharedReportUrl, decodeSharedReportId } from "./utils/urlParser";
import { initSoundSettings, buttonClickSound, successSound, alertSound, notificationSound, playSound } from "./utils/sounds";
import "./utils/print.css";
import Footer from "./components/Footer";
import useMediaQuery from "./hooks/useMediaQuery";
import MobileActionBar from "./components/MobileActionBar";
import Drawer from "./components/Drawer";

export default function App() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const [mobileCrewOpen, setMobileCrewOpen] = useState(false);
  const [mobileStardateOpen, setMobileStardateOpen] = useState(false);
  const [mobileHelpOpen, setMobileHelpOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [crewManifest, setCrewManifest] = useState<any[]>([]);
  const [lastCfg, setLastCfg] = useState<any | null>(null);
  const [config, setConfig] = useState<GeneratorConfig | null>(null);
  const [manifestPanelOpen, setManifestPanelOpen] = useState(false);
  const [currentCrewCount, setCurrentCrewCount] = useState(0);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isSharedLink, setIsSharedLink] = useState(false);
  const [sharedLinkFormat, setSharedLinkFormat] = useState<"pdf" | "docx" | "txt" | undefined>(undefined);
  // Stardate calculator state
  const [showStardateCalc, setShowStardateCalc] = useState(false);
  const [stardateOverride, setStardateOverride] = useState("");
  const [useStardateOverride, setUseStardateOverride] = useState(false);
  // Chart editing state
  const [chartEditingEnabled, setChartEditingEnabled] = useState(false);
  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  // Help panel state
  const [showHelp, setShowHelp] = useState(false);
  const [helpTarget, setHelpTarget] = useState<"templates"|"figure-bias"|"presets"|"produce-reroll"|"references"|undefined>(undefined);
  
  // Initialize sound system
  useEffect(() => {
    initSoundSettings();
  }, []);

  // Load persisted stardate override settings
  useEffect(() => {
    try {
      const savedUse = localStorage.getItem('wcr_use_stardate_override');
      const savedSd = localStorage.getItem('wcr_stardate_override');
      const savedShow = localStorage.getItem('wcr_show_stardate_calc');
      if (savedUse !== null) setUseStardateOverride(savedUse === 'true');
      if (savedSd) setStardateOverride(savedSd);
      if (savedShow !== null) setShowStardateCalc(savedShow === 'true');
    } catch {}
  }, []);

  // Persist stardate override changes
  useEffect(() => {
    try { localStorage.setItem('wcr_use_stardate_override', String(useStardateOverride)); } catch {}
  }, [useStardateOverride]);
  useEffect(() => {
    try { localStorage.setItem('wcr_stardate_override', stardateOverride || ""); } catch {}
  }, [stardateOverride]);
  useEffect(() => {
    try { localStorage.setItem('wcr_show_stardate_calc', String(showStardateCalc)); } catch {}
  }, [showStardateCalc]);

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
        
        // Ensure we use the original seed for consistency in regenerating the same report
        const seedFromReportId = reportInfo.originalSeed || reportInfo.seed || reportId;
        console.log("Using seed from shared report:", seedFromReportId);
        
        // Generate a report based on the decoded information
        const cfg: GeneratorConfig = {
          problemsCount: reportInfo.problemCount || 3,
          graphsEnabled: true,
          graphsCount: reportInfo.graphsCount || 3,
          signatoryName: reportInfo.preparedBy || "Shared Report Viewer",
          signatoryRank: reportInfo.signatoryRank || "Lieutenant",
          vessel: reportInfo.vessel || "USS Enterprise",
          stardate: reportInfo.stardate,
          problemDetailLevel: reportInfo.problemDetailLevel || 3,
          humorLevel: reportInfo.humorLevel || 5,
          figureBias: reportInfo.figureBias || "auto",
          seed: seedFromReportId // Use the original seed to ensure same report
        };
        
        console.log("Generating shared report with config:", cfg);
        
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
    // Play processing sound
    playSound('processing');
    
    // Always clone the config to avoid mutating the original
    const configToUse = { ...cfg };
    
    // Ensure stardate is set if not already provided, or override is enabled
    if (useStardateOverride && stardateOverride) {
      configToUse.stardate = stardateOverride;
    } else if (!configToUse.stardate) {
      configToUse.stardate = (50000 + Math.random() * 9999).toFixed(1);
    }
    
    // Always respect explicitly provided seeds
    if (configToUse.seed) {
      console.log("Using explicitly provided seed:", configToUse.seed);
    } 
    // Otherwise create a deterministic seed
    else if (configToUse.signatoryName) {
      configToUse.seed = configToUse.signatoryName + (configToUse.stardate || "") + Date.now().toString();
      console.log("Created new seed from signatory:", configToUse.seed);
    }
    
    // Generate the report with the enhanced config
    const r = generateReport({ 
      ...configToUse, 
      crewManifest,
      problemDetailLevel: configToUse.problemDetailLevel 
    });
    
    console.log("Generated report with seed:", r.originalSeed);
    
    // Play success sound when report is generated
    successSound();
    
    // Force a new report object to trigger updates
    setReport({...r});
    setConfig({...configToUse});
    setLastCfg({...configToUse});
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

  // Regenerate the entire report with a new seed
  const regenerateReport = () => {
    if (!config) return;
    
    // Play sound effect
    buttonClickSound();
    
    // Create a new seed
    const newSeed = Date.now().toString(36);
    console.log("Regenerating report with new seed:", newSeed);
    
    // Clone the config and update the seed
    const newConfig = {
      ...config,
      seed: newSeed,
      stardate: (50000 + Math.random() * 9999).toFixed(1) // Also generate a new stardate
    };
    
    // Generate a new report with the updated config
    handleGenerate(newConfig);
  };

  // Handler for report updates from the chart editor
  const handleReportUpdate = (updatedReport: Report) => {
    setReport(updatedReport);
    console.log("Report updated with modified charts");
  };
  
  // State for the transient toast notification
  const [showEditToast, setShowEditToast] = useState(false);
  
  // Toggle chart editing mode
  const toggleChartEditing = () => {
    const newState = !chartEditingEnabled;
    setChartEditingEnabled(newState);
    
    if (newState) {
      // Play toggle on sound
      playSound('toggleOn');
      
      // Show toast notification when entering edit mode
      setToastMessage('Chart edit mode enabled. You can now edit any chart in the report.');
      setShowToast(true);
      
      // Auto-hide the toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
      
      // Scroll to show the edit instructions
      setTimeout(() => {
        document.getElementById('edit-instructions')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      // Play toggle off sound
      playSound('toggleOff');
      
      // Show toast when exiting edit mode
      setToastMessage('Chart edit mode disabled. Changes have been saved.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const exportTxt = () => {
    if (!report) return;
    buttonClickSound();
    const txt = reportToTxt(report);
    const blob = new Blob([txt], { type: "text/plain" });
    saveAs(blob, "engineering_report.txt");
    successSound();
  };

  const exportPdf = async () => {
    if (!report) return;
    buttonClickSound();
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageHeight = (doc as any).internal?.pageSize?.getHeight
      ? (doc as any).internal.pageSize.getHeight()
      : ((doc as any).internal?.pageSize?.height || 792);
    const topMargin = 48;
    const bottomMargin = 48;
    const contentBottom = pageHeight - bottomMargin;
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
        if (yPos > contentBottom) { doc.addPage(); yPos = topMargin; }
        doc.text("Crew Manifest (Mentioned)", 48, yPos);
        yPos += 4; // small spacing under heading
        doc.setFontSize(10);
        report.crewManifest?.forEach(cm => {
          if (yPos + 15 > contentBottom) { doc.addPage(); yPos = topMargin; }
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
      // Add spacing after heading to avoid overlapping first reference
      yPos += 16;
      doc.setFontSize(10);
      report.references.forEach((r, idx) => {
        let cleanText = r.text.replace(/^\[\d+\]\s*/, "");
        const refText = `[${idx + 1}] ${cleanText}`;
        const refLines = doc.splitTextToSize(refText, 420);
        if (yPos + refLines.length * 12 > contentBottom) { doc.addPage(); yPos = topMargin; }
        doc.text(refLines, 48, yPos);
        yPos += refLines.length * 12;
      });
    });
    for (const act of actions) {
      await act();
    }
    doc.save("engineering_report.pdf");
    successSound();
  };

  const exportDocx = async () => {
    if (!report) return;
    buttonClickSound();
    const doc = buildDocx(report);
    const blob = await doc;
    saveAs(blob, "engineering_report.docx");
    successSound();
  };

  const handlePrint = () => {
    if (!report) return;
    
    buttonClickSound();
    
    // We need to wait for all SVG charts to render properly
    setTimeout(() => {
      window.print();
    }, 500);
  };
  
  const handleShare = () => {
    buttonClickSound();
    setIsShareDialogOpen(true);
  };

  // Copy helpers
  const copyToClipboard = async (text: string, successMsg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage(successMsg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1800);
    } catch (e) {
      setToastMessage('Clipboard unavailable. Copy manually.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const copyStardate = async () => {
    const value = (useStardateOverride && stardateOverride) ? stardateOverride : (report?.header.stardate || '');
    if (!value) {
      setToastMessage('No stardate available to copy.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1800);
      return;
    }
    await copyToClipboard(String(value), 'Stardate copied to clipboard.');
  };

  const copyHeaderLine = async () => {
    if (!report) {
      setToastMessage('No report header to copy yet.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1800);
      return;
    }
    const headerBlock = [
      `Stardate ${report.header.stardate} · ${report.header.vessel}`,
      `${report.header.title}`,
      `To: ${report.header.toRecipient}`,
      `CC: ${report.header.ccRecipient}`,
      `Prepared By: ${report.header.preparedBy.rank} ${report.header.preparedBy.name}, Engineering`
    ].join("\n");
    await copyToClipboard(headerBlock, 'Header copied to clipboard.');
  };

  const copyAbstract = async () => {
    if (!report?.abstract) {
      setToastMessage('No abstract available to copy.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1800);
      return;
    }
    await copyToClipboard(report.abstract, 'Abstract copied to clipboard.');
  };

  const copyProblems = async () => {
    if (!report?.problems?.length) {
      setToastMessage('No problems available to copy.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1800);
      return;
    }
    const text = report.problems
      .map((p, i) => `Problem ${i + 1}: ${p.title}\n${p.summary}`)
      .join('\n\n');
    await copyToClipboard(text, 'Problems copied to clipboard.');
  };

  const copyConclusion = async () => {
    if (!report?.conclusion) {
      setToastMessage('No conclusion available to copy.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1800);
      return;
    }
    await copyToClipboard(report.conclusion, 'Conclusion copied to clipboard.');
  };

  const copyReferences = async () => {
    if (!report?.references?.length) {
      setToastMessage('No references available to copy.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1800);
      return;
    }
    const text = report.references.map((r, i) => `[${i + 1}] ${r.text.replace(/^\[\d+\]\s*/, '')}`).join('\n');
    await copyToClipboard(text, 'References copied to clipboard.');
  };

  const copyProblemItem = async (index: number) => {
    if (!report?.problems?.[index]) return;
    const p = report.problems[index];
    const text = `Problem ${index + 1}: ${p.title}\n${p.summary}`;
    await copyToClipboard(text, 'Problem copied to clipboard.');
  };

  const copyCrewManifest = async () => {
    const crew = report?.crewManifest || [];
    if (!crew.length) {
      setToastMessage('No crew manifest to copy.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
      return;
    }
    const text = crew.map(cm => `${cm.rank} ${cm.name}, ${cm.role}`).join('\n');
    await copyToClipboard(text, 'Crew manifest copied to clipboard.');
  };

  const copyFigures = async () => {
    if (!report?.figures?.length) {
      setToastMessage('No figures to copy.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
      return;
    }
    // Recreate sequential figure numbering by traversing problems in order
    let n = 1;
    const lines: string[] = [];
    report.problems.forEach(p => {
      const figs = (report.figures || []).filter(f => f.sectionAnchor === p.id);
      figs.forEach(f => {
        lines.push(`Figure ${n}: ${f.title} — ${f.caption}`);
        n += 1;
      });
    });
    // Include any figures not tied to a problem at the end
    const anchoredIds = new Set(report.problems.flatMap(p => (report!.figures || []).filter(f=>f.sectionAnchor===p.id).map(f=>f.id)));
    (report.figures || []).forEach(f => {
      if (!anchoredIds.has(f.id)) {
        lines.push(`Figure ${n}: ${f.title} — ${f.caption}`);
        n += 1;
      }
    });
    await copyToClipboard(lines.join('\n'), 'Figures copied to clipboard.');
  };

  return (
    <div className="min-h-screen bg-[#0b0d16] text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-extrabold">Starfleet Engineering Report Generator</h1>
          <SoundControls />
        </div>
        
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
          onRegenerate={report ? regenerateReport : undefined}
          onOpenHelp={(section) => { setHelpTarget(section); setShowHelp(true); }}
        />
        {manifestPanelOpen && (
          <CrewManifestPanel 
            count={currentCrewCount} 
            onCrewChange={handleCrewChange} 
            onRegenerate={regenerateCrewManifest}
          />
        )}

        <div className="mt-2 flex items-center gap-3">
          <button className="lcars-btn" onClick={()=>setShowStardateCalc(v=>!v)}>
            {showStardateCalc ? "Hide Stardate Calculator" : "Show Stardate Calculator"}
          </button>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={useStardateOverride} onChange={e=>setUseStardateOverride(e.target.checked)} />
            <span className="lcars-label">Use Stardate in Report</span>
          </label>
          {useStardateOverride && (
            <span className="lcars-small">Current: {stardateOverride || "—"}</span>
          )}
          <button
            className="lcars-btn"
            onClick={copyStardate}
            title="Copy current stardate"
            aria-label="Copy current stardate"
            disabled={!((useStardateOverride && !!stardateOverride) || !!report)}
          >
            Copy Stardate
          </button>
        </div>
        {showStardateCalc && (
          <StardateCalculator
            onStardateChange={(sd)=>setStardateOverride(sd)}
            currentStardate={stardateOverride}
          />
        )}
        <div id="button-bar" className="flex flex-wrap gap-3 mb-6 sticky top-4 z-10 bg-[#0b0d16] p-3 rounded-xl border border-slate-700 shadow-lg transition-all duration-300">
          <button onClick={exportTxt} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all duration-200">Download TXT</button>
          <button onClick={async()=>{ if(!report){ setToastMessage('No report to copy.'); setShowToast(true); setTimeout(()=>setShowToast(false),1500); return;} await copyToClipboard(reportToTxt(report), 'Full report copied as TXT.'); }} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all duration-200" title="Copy full report as plain text" aria-label="Copy full report as plain text">Copy Full Report (TXT)</button>
          <button onClick={exportPdf} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all duration-200">Download PDF</button>
          <button onClick={exportDocx} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all duration-200">Download DOCX</button>
          <button onClick={handlePrint} className="px-3 py-2 rounded-xl bg-amber-600 text-black font-bold border border-amber-500 hover:bg-amber-500 transition-all duration-200">Print Report</button>
          <button 
            onClick={handleShare} 
            className="px-3 py-2 rounded-xl bg-blue-600 text-white font-bold border border-blue-500 hover:bg-blue-500 transition-all duration-200"
            disabled={!report}
          >
            Share Report
          </button>
          
          
          
          {report && (
            <button 
              onClick={toggleChartEditing} 
              className={`px-3 py-2 rounded-xl font-bold border transition-all duration-200 ${
                chartEditingEnabled 
                  ? 'bg-purple-600 border-purple-500 text-white hover:bg-purple-700' 
                  : 'bg-slate-800 border-slate-700 text-white hover:bg-purple-900 hover:border-purple-700'
              }`}
            >
              {chartEditingEnabled ? 'Exit Chart Editing' : 'Edit Charts'}
            </button>
          )}

          <button
            onClick={() => setShowHelp(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all duration-200 ml-auto"
            title="Open Help"
            aria-label="Open Help"
          >
            Help
          </button>
        </div>
        {showHelp && (
          <HelpPanel onClose={() => setShowHelp(false)} target={helpTarget} />
        )}
        
        {report ? (
          <>
            {chartEditingEnabled && (
              <div id="edit-instructions" className="mb-6 p-4 bg-purple-900 text-white rounded-lg animate-fadeIn border-2 border-purple-500 shadow-lg">
                <div className="flex items-center gap-2 font-bold mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                  </svg>
                  Chart Edit Mode Enabled
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm">Hover over any chart and click the edit icon <span className="inline-block bg-amber-500 text-black p-1 rounded ml-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                      </svg>
                    </span> that appears to modify it. Your changes will be saved automatically.</p>
                    <p className="text-sm mt-2">You can change chart type, data values, and other properties.</p>
                  </div>
                  <button 
                    onClick={toggleChartEditing}
                    className="px-4 py-2 bg-white text-purple-900 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                  >
                    Exit Edit Mode
                  </button>
                </div>
              </div>
            )}
            
            <ReportPreview 
              report={report} 
              onReportUpdate={handleReportUpdate}
              editEnabled={chartEditingEnabled}
              onCopyHeaderLine={copyHeaderLine}
              onCopyAbstract={copyAbstract}
              onCopyProblems={copyProblems}
              onCopyConclusion={copyConclusion}
              onCopyReferences={copyReferences}
              onCopyProblemItem={copyProblemItem}
              onCopyCrewManifest={copyCrewManifest}
              missionTemplate={config?.missionTemplate || 'none'}
            />
          </>
        ) : (
          <div>No report yet.</div>
        )}
        
        {report && (
          <ShareDialog 
            report={report} 
            isOpen={isShareDialogOpen} 
            onClose={() => setIsShareDialogOpen(false)} 
          />
        )}
        
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-purple-900 text-white px-6 py-3 rounded-lg shadow-lg animate-fadeIn z-50 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
            </svg>
            {toastMessage}
          </div>
        )}
        {/* Mobile overlays (non-desktop) */}
        {!isDesktop && (
          <>
            <MobileActionBar
              onOpenControls={()=>setMobileControlsOpen(true)}
              onOpenCrew={()=>setMobileCrewOpen(true)}
              onOpenStardate={()=>setMobileStardateOpen(true)}
              onOpenHelp={()=>setMobileHelpOpen(true)}
              onOpenMore={()=>setMobileMoreOpen(true)}
            />
            <Drawer open={mobileControlsOpen} onClose={()=>setMobileControlsOpen(false)} title="Controls">
              <ReportControls
                onGenerate={handleGenerate}
                onPreviewCrew={handlePreviewCrewToggle}
                manifestPanelOpen={manifestPanelOpen}
                onRegenerate={report ? regenerateReport : undefined}
                onOpenHelp={(section) => { setHelpTarget(section); setMobileControlsOpen(false); setMobileHelpOpen(true); }}
              />
            </Drawer>
            <Drawer open={mobileCrewOpen} onClose={()=>setMobileCrewOpen(false)} title="Crew Manifest">
              <CrewManifestPanel
                count={currentCrewCount}
                onCrewChange={handleCrewChange}
                onRegenerate={regenerateCrewManifest}
              />
            </Drawer>
            <Drawer open={mobileStardateOpen} onClose={()=>setMobileStardateOpen(false)} title="Stardate">
              <div className="space-y-3 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={useStardateOverride} onChange={e=>setUseStardateOverride(e.target.checked)} />
                  <span>Use Override</span>
                  {useStardateOverride && (<span className="opacity-70">{stardateOverride || '—'}</span>)}
                </label>
                <StardateCalculator onStardateChange={(sd)=>setStardateOverride(sd)} currentStardate={stardateOverride} />
                <button onClick={copyStardate} className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-xs" disabled={!((useStardateOverride && !!stardateOverride) || !!report)}>Copy Stardate</button>
              </div>
            </Drawer>
            <Drawer open={mobileHelpOpen} onClose={()=>setMobileHelpOpen(false)} title="Help">
              <HelpPanel onClose={()=>setMobileHelpOpen(false)} target={helpTarget} />
            </Drawer>
            <Drawer open={mobileMoreOpen} onClose={()=>setMobileMoreOpen(false)} title="More">
              <div className="space-y-4 text-sm">
                <SoundControls />
              </div>
            </Drawer>
          </>
        )}
        <Footer />
      </div>
    </div>
  );
}
