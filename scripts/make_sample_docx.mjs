import fs from "fs";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";

function makeSampleDocx(outPath) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({ text: "USS Enterprise NCC-1701-D Engineering Report", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: "Stardate: 48041.1" }),
          new Paragraph({ text: "Vessel: USS Enterprise NCC-1701-D" }),
          new Paragraph({ text: "Prepared By: Lt. Cmdr. Engineer, Test, Engineering" }),
          new Paragraph({ text: "Submitted To: Starfleet Corps of Engineers" }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "Abstract", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "This sample demonstrates DOCX layout: headings and paragraphs. Charts are omitted in the sample." }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "Problem 1: Warp Core Containment", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "Detected anomaly in the warp core containment field. Diagnostics executed and corrective measures applied." }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "Conclusion", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "All identified issues have been resolved. Systems operating within normal parameters." }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "References", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ children: [ new TextRun("[1] Engineering Log: Shipboard Diagnostics") ] }),
          new Paragraph({ children: [ new TextRun("[2] Warp Core Diagnostics — Starfleet Technical Orders") ] }),
        ],
      },
    ],
  });

  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(outPath, buffer);
    console.log(`Wrote sample DOCX: ${outPath}`);
  });
}

const out = process.argv[2] || "Sample_Engineering_Report.docx";
makeSampleDocx(out);
