import fs from 'fs';

function makeSampleTxt(outPath: string) {
  const lines: string[] = [];
  lines.push("USS Enterprise NCC-1701-D Engineering Report");
  lines.push("");
  lines.push("Stardate: 48041.1");
  lines.push("Vessel: USS Enterprise NCC-1701-D");
  lines.push("Prepared By: Lt. Cmdr. Engineer, Test, Engineering");
  lines.push("Submitted To: Starfleet Corps of Engineers");
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
