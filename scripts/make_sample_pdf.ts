import { jsPDF } from "jspdf";
import fs from "fs";

function makeSamplePdf(outPath: string) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageHeight = (doc as any).internal?.pageSize?.getHeight
    ? (doc as any).internal.pageSize.getHeight()
    : ((doc as any).internal?.pageSize?.height || 792);
  const top = 48, left = 48, right = 564, bottom = 48;
  const contentBottom = pageHeight - bottom;
  let y = top;

  const textBlock = (t: string, size = 10, leading = 12, width = 500) => {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(t, width);
    if (y + lines.length * leading > contentBottom) { doc.addPage(); y = top; }
    doc.text(lines, left, y);
    y += lines.length * leading;
  };

  // Header
  doc.setFontSize(18);
  doc.text("USS Enterprise NCC-1701-D Engineering Report", left, y);
  y += 28;
  doc.setFontSize(12);
  doc.text("Stardate: 48041.1", left, y); y += 16;
  doc.text("Vessel: USS Enterprise NCC-1701-D", left, y); y += 16;
  doc.text("Prepared By: Lt. Cmdr. Engineer, Test, Engineering", left, y); y += 16;
  doc.text("Submitted To: Starfleet Corps of Engineers", left, y); y += 20;

  // Abstract
  doc.setFontSize(14);
  doc.text("Abstract", left, y); y += 16;
  textBlock("This sample demonstrates the PDF layout: headings, paragraph flow, and references numbering. Charts are omitted in the sample.");

  // Problems
  doc.setFontSize(14);
  y += 16; if (y > contentBottom) { doc.addPage(); y = top; }
  doc.text("Problem 1: Warp Core Containment", left, y); y += 16;
  textBlock("Detected anomaly in the warp core containment field. Engineering team executed diagnostics and implemented corrective measures per Starfleet regulation 1287-A.");

  y += 8; if (y > contentBottom) { doc.addPage(); y = top; }
  doc.text("Problem 2: EPS Conduit Overheating", left, y); y += 16;
  textBlock("Localized overheating in EPS conduits. Re-routed power and recalibrated regulators. Post-repair diagnostics indicate nominal performance.");

  // Crew Manifest
  y += 16; if (y > contentBottom) { doc.addPage(); y = top; }
  doc.setFontSize(14);
  doc.text("Crew Manifest (Mentioned)", left, y); y += 4;
  doc.setFontSize(10);
  const crew = [
    "- Lieutenant Engineer, Test (Chief Engineer)",
    "- Ensign Smith, Jane (Diagnostics)",
    "- Ensign Doe, John (Operations)",
    "- Lieutenant JG Park, Amy (Systems)"
  ];
  for (const line of crew) {
    if (y + 15 > contentBottom) { doc.addPage(); y = top; }
    y += 15; doc.text(line, left, y);
  }

  // Conclusion
  y += 16; if (y > contentBottom) { doc.addPage(); y = top; }
  doc.setFontSize(14); doc.text("Conclusion", left, y); y += 16;
  textBlock("All identified issues have been resolved. Systems operating within normal parameters. Continued monitoring recommended.");

  // References
  y += 16; if (y > contentBottom) { doc.addPage(); y = top; }
  doc.setFontSize(14); doc.text("References", left, y); y += 16;
  doc.setFontSize(10);
  const refs = [
    "[1] Engineer, Test Lieutenant, Chief Engineer — *Engineering Log: Shipboard Diagnostics* (Technical Bulletin), Starfleet Engineering Journal, Engineering Division, Stardate: 48041.1",
    "[2] La Forge, Geordi Lt. Cmdr., Chief Engineer — *Warp Core Diagnostics* (Journal Article), Starfleet Technical Orders, Engineering Division, Stardate: 48022.5",
    "[3] O'Brien, Miles Chief, Transporter Chief — *EPS Conduit Maintenance* (Maintenance Log), Starfleet Ship Systems Compendium, Operations Division, Stardate: 48012.3"
  ];
  for (const r of refs) {
    const lines = doc.splitTextToSize(r, 420);
    if (y + lines.length * 12 > contentBottom) { doc.addPage(); y = top; }
    doc.text(lines, left, y);
    y += lines.length * 12;
  }

  const pdfBytes = doc.output("arraybuffer") as ArrayBuffer;
  fs.writeFileSync(outPath, Buffer.from(pdfBytes));
}

const out = process.argv[2] || "Sample_Engineering_Report.pdf";
makeSamplePdf(out);
console.log(`Wrote sample PDF: ${out}`);
