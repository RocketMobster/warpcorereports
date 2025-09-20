import fs from "fs";import fs from 'fs';



function makeSampleTxt(outPath: string) {function makeSampleTxt(outPath: string) {

  const content = `USS Enterprise NCC-1701-D Engineering Report\n\nStardate: 48041.1\nVessel: USS Enterprise NCC-1701-D\nPrepared By: Lt. Cmdr. Engineer, Test, Engineering\nSubmitted To: Starfleet Corps of Engineers\n\nAbstract\nThis sample demonstrates the TXT layout: headings and paragraphs. Charts are omitted in the sample.\n\nProblem 1: Warp Core Containment\nDetected anomaly in the warp core containment field. Diagnostics executed and corrective measures applied.\n\nConclusion\nAll identified issues have been resolved. Systems operating within normal parameters.\n\nReferences\n[1] Engineering Log: Shipboard Diagnostics\n[2] Warp Core Diagnostics — Starfleet Technical Orders\n`;  const lines: string[] = [];

  fs.writeFileSync(outPath, content, "utf8");  lines.push("USS Enterprise NCC-1701-D Engineering Report");

  console.log(`Wrote sample TXT: ${outPath}`);  lines.push("");

}  lines.push("Stardate: 48041.1");

  lines.push("Vessel: USS Enterprise NCC-1701-D");

const out = process.argv[2] || "Sample_Engineering_Report.txt";  lines.push("Prepared By: Lt. Cmdr. Engineer, Test, Engineering");

makeSampleTxt(out);  lines.push("Submitted To: Starfleet Corps of Engineers");

  lines.push("");
  lines.push("Abstract");
  lines.push("This sample demonstrates the TXT layout: headings, paragraph flow, and references numbering. Charts are omitted in the sample.");
  lines.push("");
  lines.push("Problem 1: Warp Core Containment");
  lines.push("Detected anomaly in the warp core containment field. Engineering team executed diagnostics and implemented corrective measures per Starfleet regulation 1287-A.");
  lines.push("");
  lines.push("Problem 2: EPS Conduit Overheating");
  lines.push("Localized overheating in EPS conduits. Re-routed power and recalibrated regulators. Post-repair diagnostics indicate nominal performance.");
  lines.push("");
  lines.push("Crew Manifest (Mentioned)");
  lines.push("- Lieutenant Engineer, Test (Chief Engineer)");
  lines.push("- Ensign Smith, Jane (Diagnostics)");
  lines.push("- Ensign Doe, John (Operations)");
  lines.push("- Lieutenant JG Park, Amy (Systems)");
  lines.push("");
  lines.push("Conclusion");
  lines.push("All identified issues have been resolved. Systems operating within normal parameters. Continued monitoring recommended.");
  lines.push("");
  lines.push("References");
  lines.push("[1] Engineer, Test Lieutenant, Chief Engineer — Engineering Log: Shipboard Diagnostics (Technical Bulletin), Starfleet Engineering Journal, Engineering Division, Stardate: 48041.1");
  lines.push("[2] La Forge, Geordi Lt. Cmdr., Chief Engineer — Warp Core Diagnostics (Journal Article), Starfleet Technical Orders, Engineering Division, Stardate: 48022.5");
  lines.push("[3] O'Brien, Miles Chief, Transporter Chief — EPS Conduit Maintenance (Maintenance Log), Starfleet Ship Systems Compendium, Operations Division, Stardate: 48012.3");

  fs.writeFileSync(outPath, lines.join('\n'));
  console.log(`Wrote sample TXT: ${outPath}`);
}

const out = process.argv[2] || 'Sample_Engineering_Report.txt';
makeSampleTxt(out);
