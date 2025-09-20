import fs from "fs";

function makeSampleTxt(outPath) {
  const content = `USS Enterprise NCC-1701-D Engineering Report\n\nStardate: 48041.1\nVessel: USS Enterprise NCC-1701-D\nPrepared By: Lt. Cmdr. Engineer, Test, Engineering\nSubmitted To: Starfleet Corps of Engineers\n\nAbstract\nThis sample demonstrates the TXT layout: headings and paragraphs. Charts are omitted in the sample.\n\nProblem 1: Warp Core Containment\nDetected anomaly in the warp core containment field. Diagnostics executed and corrective measures applied.\n\nConclusion\nAll identified issues have been resolved. Systems operating within normal parameters.\n\nReferences\n[1] Engineering Log: Shipboard Diagnostics\n[2] Warp Core Diagnostics — Starfleet Technical Orders\n`;
  fs.writeFileSync(outPath, content, "utf8");
  console.log(`Wrote sample TXT: ${outPath}`);
}

const out = process.argv[2] || "Sample_Engineering_Report.txt";
makeSampleTxt(out);
