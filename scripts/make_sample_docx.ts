import fs from "fs";import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";

import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";import fs from "fs";



function makeSampleDocx(outPath: string) {async function makeSampleDocx(outPath: string) {

  const doc = new Document({  const doc = new Document({

    sections: [    sections: [

      {      {

        properties: {},        properties: {},

        children: [        children: [

          new Paragraph({ text: "USS Enterprise NCC-1701-D Engineering Report", heading: HeadingLevel.HEADING_1 }),          new Paragraph({ text: "USS Enterprise NCC-1701-D Engineering Report", heading: HeadingLevel.TITLE }),

          new Paragraph({ text: "Stardate: 48041.1" }),          new Paragraph({ text: "" }),

          new Paragraph({ text: "Vessel: USS Enterprise NCC-1701-D" }),          new Paragraph({ children: [ new TextRun({ text: "Stardate: ", bold: true }), new TextRun("48041.1") ] }),

          new Paragraph({ text: "Prepared By: Lt. Cmdr. Engineer, Test, Engineering" }),          new Paragraph({ children: [ new TextRun({ text: "Vessel: ", bold: true }), new TextRun("USS Enterprise NCC-1701-D") ] }),

          new Paragraph({ text: "Submitted To: Starfleet Corps of Engineers" }),          new Paragraph({ children: [ new TextRun({ text: "Prepared By: ", bold: true }), new TextRun("Lt. Cmdr. Engineer, Test, Engineering") ] }),

          new Paragraph({ text: "" }),          new Paragraph({ children: [ new TextRun({ text: "Submitted To: ", bold: true }), new TextRun("Starfleet Corps of Engineers") ] }),

          new Paragraph({ text: "Abstract", heading: HeadingLevel.HEADING_2 }),          new Paragraph({ text: "" }),

          new Paragraph({ text: "This sample demonstrates DOCX layout: headings and paragraphs. Charts are omitted in the sample." }),

          new Paragraph({ text: "" }),          new Paragraph({ text: "Abstract", heading: HeadingLevel.HEADING_2 }),

          new Paragraph({ text: "Problem 1: Warp Core Containment", heading: HeadingLevel.HEADING_2 }),          new Paragraph({ text: "This sample demonstrates the DOCX layout: headings, paragraph flow, and references numbering. Charts are omitted in the sample." }),

          new Paragraph({ text: "Detected anomaly in the warp core containment field. Diagnostics executed and corrective measures applied." }),

          new Paragraph({ text: "" }),          new Paragraph({ text: "Problem 1: Warp Core Containment", heading: HeadingLevel.HEADING_2 }),

          new Paragraph({ text: "Conclusion", heading: HeadingLevel.HEADING_2 }),          new Paragraph({ text: "Detected anomaly in the warp core containment field. Engineering team executed diagnostics and implemented corrective measures per Starfleet regulation 1287-A." }),

          new Paragraph({ text: "All identified issues have been resolved. Systems operating within normal parameters." }),

          new Paragraph({ text: "" }),          new Paragraph({ text: "Problem 2: EPS Conduit Overheating", heading: HeadingLevel.HEADING_2 }),

          new Paragraph({ text: "References", heading: HeadingLevel.HEADING_2 }),          new Paragraph({ text: "Localized overheating in EPS conduits. Re-routed power and recalibrated regulators. Post-repair diagnostics indicate nominal performance." }),

          new Paragraph({ children: [ new TextRun("[1] Engineering Log: Shipboard Diagnostics") ] }),

          new Paragraph({ children: [ new TextRun("[2] Warp Core Diagnostics — Starfleet Technical Orders") ] }),          new Paragraph({ text: "Conclusion", heading: HeadingLevel.HEADING_2 }),

        ],          new Paragraph({ text: "All identified issues have been resolved. Systems operating within normal parameters. Continued monitoring recommended." }),

      },

    ],          new Paragraph({ text: "References", heading: HeadingLevel.HEADING_2 }),

  });          new Paragraph({ text: "[1] Engineer, Test Lieutenant, Chief Engineer — Engineering Log: Shipboard Diagnostics (Technical Bulletin), Starfleet Engineering Journal, Engineering Division, Stardate: 48041.1" }),

          new Paragraph({ text: "[2] La Forge, Geordi Lt. Cmdr., Chief Engineer — Warp Core Diagnostics (Journal Article), Starfleet Technical Orders, Engineering Division, Stardate: 48022.5" }),

  Packer.toBuffer(doc).then((buffer) => {          new Paragraph({ text: "[3] O'Brien, Miles Chief, Transporter Chief — EPS Conduit Maintenance (Maintenance Log), Starfleet Ship Systems Compendium, Operations Division, Stardate: 48012.3" }),

    fs.writeFileSync(outPath, buffer);        ],

    console.log(`Wrote sample DOCX: ${outPath}`);      },

  });    ],

}  });



const out = process.argv[2] || "Sample_Engineering_Report.docx";  const buf = await Packer.toBuffer(doc);

makeSampleDocx(out);  fs.writeFileSync(outPath, buf);

  console.log(`Wrote sample DOCX: ${outPath}`);
}

const out = process.argv[2] || "Sample_Engineering_Report.docx";
makeSampleDocx(out).catch(err => {
  console.error("Failed to write DOCX:", err);
  process.exit(1);
});
