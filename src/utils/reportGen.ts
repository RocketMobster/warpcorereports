import { GeneratorConfig, Report, Figure, CrewMember, FigureBias } from "../types";
import { Reference } from "../types";
import { STARFLEET_VESSELS } from "../types";
import { pick, randint, POOLS, humorousAside, xorshift32, seedFromConfig, pickCrewName } from "./helpers";

type FigType = "line" | "bar" | "scatter" | "gauge" | "pie" | "area" | "radar" | "heatmap" | "step" | "boxplot";

function preferredTypesFor(system: string, bias: FigureBias): FigType[] {
  if (bias && bias !== "auto") {
    if (bias === "warp") return ["line","scatter","area","step"];
    if (bias === "eps") return ["bar","line","pie","heatmap"];
    if (bias === "sif") return ["gauge","bar","boxplot"];
    if (bias === "deflector") return ["scatter","line","radar"];
    if (bias === "transporter") return ["scatter","line","pie"];
    if (bias === "inertial") return ["gauge","line","step"];
  }
  const key = system.toLowerCase();
  if (key.includes("warp")) return ["line","scatter","area","step"];
  if (key.includes("eps")) return ["bar","line","pie","heatmap"];
  if (key.includes("integrity") || key.includes("sif")) return ["gauge","bar","boxplot"];
  if (key.includes("deflector")) return ["scatter","line","radar"];
  if (key.includes("transporter")) return ["scatter","line","pie"];
  if (key.includes("inertial")) return ["gauge","line","step"];
  return ["line","bar","scatter","gauge","pie","area","radar","heatmap","step","boxplot"];
}

function makeFigure(i:number, anchorId:string, sys:string, bias:FigureBias, rnd:()=>number): Figure {
  // Helper to determine if a chart title is suitable for heatmap (categorical/distribution)
  function isHeatmapEligible(title: string): boolean {
    const forbidden = ["time", "over time", "temperature", "spectrum", "variance", "output", "analysis", "trend", "distribution"];
    return !forbidden.some(f => title.toLowerCase().includes(f));
  }
  // Helper to determine if a chart title is categorical (for pie chart eligibility)
  function isCategoricalTitle(title: string): boolean {
    const forbidden = ["time", "over time", "temperature", "spectrum", "variance", "output", "analysis", "trend", "distribution", "over", "vs.", "scatterplot", "line", "continuous"];
    return !forbidden.some(f => title.toLowerCase().includes(f));
  }
  // Helper to determine if a chart title is a scatterplot
  function isScatterplotTitle(title: string): boolean {
    return /scatterplot/i.test(title);
  }
  // Track used captions to avoid repeats per report
  if (!(globalThis as any).__usedFigureCaptions) {
    (globalThis as any).__usedFigureCaptions = new Set<string>();
  }
  let prefs = preferredTypesFor(sys, bias);
  let type = prefs[Math.floor(rnd()*prefs.length)];
  // Diverse chart/figure titles
  const chartTemplates = [
    "Phase Error vs. Temperature of {system}",
    "{system} Power Output Over Time",
    "{system} Harmonic Variance Analysis",
    "{system} Diagnostic Gauge",
    "{system} Subspace Field Strength",
    "{system} Plasma Flow Distribution",
    "{system} Quantum Flux Scatterplot",
    "{system} Integrity Stress Test",
    "{system} Modulation Pattern",
    "{system} Resonance vs. Output",
    "{system} Calibration Results",
    "{system} Load by Relay",
    "{system} Injector Variance (Pre/Post)",
    "{system} Diagnostic Chart",
    "{system} Performance Metrics"
  ];
  // Pick a template and fill in system/jargon
  let template = chartTemplates[Math.floor(rnd()*chartTemplates.length)];
  // Optionally add a jargon phrase for more diversity
  const jargon = pick(POOLS.jargon, rnd);
  if (rnd() < 0.5) {
    template = template.replace("{system}", `${sys} (${jargon})`);
  } else {
    template = template.replace("{system}", sys);
  }
  // Force scatter type for scatterplot titles
  if (isScatterplotTitle(template)) type = "scatter";
  const id = `Fig-${i+1}`;
  const title = template;
  // Data generators for each chart type
  const len = 18 + Math.floor(rnd()*20);
  const line = Array.from({length:len},(_,t)=>+(0.4+0.6*Math.exp(-t/8)+rnd()*0.08).toFixed(3));
  const barLen = 3 + Math.floor(rnd()*6); // 3-8 bars
  const bar = Array.from({length:barLen},()=>Math.round(30+rnd()*70));
  const scatterLen = 20 + Math.floor(rnd()*30); // 20-50 points
  const scatter = Array.from({length:scatterLen},()=>({x:+(rnd()*100).toFixed(2), y:+(rnd()*100).toFixed(2)}));
  // Updated: gauge now generates 3 random values for multi-bar support
  const gauge = Array.from({length:3},()=>40 + Math.floor(rnd()*61)); // 3 gauges, 40-100
  let pie: number[] = [];
  let pieLabels: string[] = [];
  if (isCategoricalTitle(title)) {
    const pieLen = 3 + Math.floor(rnd()*6); // 3-8 slices
    const pieRaw = Array.from({length:pieLen},()=>Math.round(10+rnd()*40));
    const pieSum = pieRaw.reduce((a,b)=>a+b,0);
    pie = pieRaw.map(v=>+(v/pieSum*100).toFixed(2));
    pieLabels = Array.from({length:pieLen},(_,i)=>`Setting ${i+1}`);
  }
  const area = Array.from({length:len},(_,t)=>+(0.2+0.8*Math.exp(-t/10)+rnd()*0.1).toFixed(3));
  const radarLen = 4 + Math.floor(rnd()*5); // 4-8 metrics
  const radar = Array.from({length:radarLen},()=>Math.round(30+rnd()*70));
  const heatmapSize = 4 + Math.floor(rnd()*2); // 4x4 or 5x5
  const heatmap = Array.from({length:heatmapSize},()=>Array.from({length:heatmapSize},()=>Math.round(20+rnd()*80)));
  const stepLen = 10 + Math.floor(rnd()*10);
  let last = 0;
  const step = Array.from({length:stepLen},()=>last += Math.round((rnd()-0.5)*20));
  const boxRaw = Array.from({length:20},()=>Math.round(30+rnd()*70));
  boxRaw.sort((a,b)=>a-b);
  const boxplot = {
    min: boxRaw[0],
    q1: boxRaw[5],
    median: boxRaw[10],
    q3: boxRaw[15],
    max: boxRaw[19],
    outliers: boxRaw.filter((v,i)=>i<2||i>17)
  };
  let data, labels;
  switch(type) {
    case "line": data = line; break;
    case "bar": data = bar; break;
    case "scatter": data = scatter; break;
    case "gauge": data = gauge; break;
    case "pie":
      if (pie.length >= 3) {
        data = pie;
        labels = pieLabels;
      } else {
        // fallback to bar chart if pie is not appropriate
        data = bar;
      }
      break;
    case "area": data = area; break;
    case "radar": data = radar; break;
    case "heatmap":
      // Defensive: ensure heatmap is a valid 2D array and all rows have equal length
      if (
        isHeatmapEligible(title) &&
        Array.isArray(heatmap) &&
        Array.isArray(heatmap[0]) &&
        heatmap.length >= 2 &&
        heatmap.every(row => Array.isArray(row) && row.length === heatmap[0].length && row.length >= 2)
      ) {
        data = heatmap;
      } else {
        // fallback to bar chart if heatmap is not appropriate or data is invalid
        type = "bar";
        data = bar;
      }
      break;
    case "step": data = step; break;
    case "boxplot": data = boxplot; break;
    default: data = line;
  }
  let caption;
  if (typeof (globalThis as any).__reportHumorLevel === "number") {
    const humor = (globalThis as any).__reportHumorLevel;
    let options;
    if (humor <= 2) {
      options = ["LCARS diagnostic output; post-corrective stability observed."];
    } else if (humor <= 7) {
      options = [
        "Chart generated per Starfleet Engineering Protocol.",
        "All readings nominal after corrective action.",
        "Diagnostic chart confirms successful repair.",
        "Engineering team recommends further monitoring.",
        "No tribbles detected in system during scan."
      ];
    } else {
      options = [
        "Chart may contain traces of tribble fur.",
        "Diagnostic output interpreted as modern art.",
        "Chart generated after coffee break.",
        "All readings nominal, except for the ones that aren't.",
        "Engineering team denies responsibility for any glitter found in system."
      ];
    }
    // Filter out used captions
    const used = (globalThis as any).__usedFigureCaptions;
    const available = options.filter(opt => !used.has(opt));
    if (available.length) {
      caption = pick(available, rnd);
      used.add(caption);
    } else {
      caption = pick(options, rnd); // fallback if all used
    }
  } else {
    caption = "LCARS diagnostic output; post-corrective stability observed.";
  }
  return { id, index:i, title, type, data, caption, sectionAnchor: anchorId, ...(labels ? { labels } : {}) };
}

function makeCrew(rnd:()=>number): CrewMember {
  // Use pickCrewName to avoid duplicate first/last names
  const name = pickCrewName(rnd);
  const rank = pick(POOLS.crewRanks, rnd);
  const role = pick(POOLS.crewRoles, rnd);
  return { name, rank, role };
}

export function generateCrewManifest(count?: number, seed?: string|number, fallbackKey?: string): CrewMember[] {
  let actualSeed = seed;
  if (actualSeed === undefined || actualSeed === null || (typeof actualSeed === 'string' && actualSeed.trim() === '')) {
    actualSeed = Math.floor(Math.random() * 1e9).toString(36);
  }
  const rnd = xorshift32(seedFromConfig(actualSeed, fallbackKey));
  // If count is not provided, pick random between 3 and 10
  const crewCount = (typeof count === 'number' && count > 0) ? count : (3 + Math.floor(rnd() * 8));
  return Array.from({length: crewCount}, () => makeCrew(rnd));
}

export function generateReport(cfg: GeneratorConfig & { crewManifest?: CrewMember[] }): Report {
  // Expanded humor pool (entries using rnd/randint are functions)
  const humorPool = [
    () => `Engineering team recommends further monitoring of the affected system.`,
    () => `Crew morale unaffected by recent events.`,
    () => `No tribbles were harmed during diagnostics.`,
    () => `Diagnostics completed ahead of schedule.`,
    () => `Starfleet regulation ${randint(1000, 9999, rnd)}-${String.fromCharCode(65 + Math.floor(rnd() * 26))} was referenced.`,
    () => `A passing ensign suggested turning it off and on again; suggestion was not implemented.`,
    () => `System briefly quoted Shakespeare before returning to normal operation.`,
    () => `Crew member received commendation for quick thinking.`,
    () => `System requested a vacation to Risa before resuming normal operations.`,
    () => `Diagnostic protocol included spirited round of "Name That Plasma Leak".`,
    () => `Replicators produced lukewarm stew when "chocolate sundae" was requested.`,
    () => `A tribble was discovered asleep on the phase discriminator; gently relocated.`,
    () => `Coffee in Engineering reaffirmed as mission-critical resource.`,
    () => `Bussard collectors reported traces of glitter; cause unknown, morale high.`,
    () => `Environmental controls in Ten Forward switched to Risa climate for 3.5 minutes.`,
    () => `Holodeck briefly displayed images of 20th century cartoon characters.`,
    () => `Counselor suggested team-building exercises; Engineering declined with impressive solidarity.`,
    () => `Unexpected harmonic vibrations in Deck 12 resulted in spontaneous crew dance party.`,
    () => `Automated voice interface referred to Captain as "Your Majesty" for one duty shift.`,
    () => `Experimental sensor calibration picked up subspace transmission of what appears to be Klingon opera.`,
    () => `Lieutenant's coffee mug found to contain dilithium-infused blend; warp-speed alertness reported.`,
    () => `Crew member attempted to recalibrate the warp core using a rubber chicken; results inconclusive.`,
    () => `Engineering team held a contest for best plasma leak pun; results classified.`,
    () => `Transporter malfunction briefly swapped crew members' shoes; confusion ensued.`,
    () => `Chief Engineer declared "Red Alert" after discovering empty coffee pot.`,
    () => `Starfleet Command sent a memo reminding crew that "tribbles are not authorized diagnostic tools."`,
    () => `Holodeck safety protocols engaged after crew attempted to simulate a warp core breach for fun.`,
    () => `Crew member programmed the computer to respond to "Make it so" with a cheerful beep.`,
    () => `Engineering team discovered a hidden cache of 21st-century memes in the computer core.`,
    () => `Crew member's attempt to fix the transporter resulted in a brief appearance of a mustache on all crew photos.`,
    () => `Starfleet regulations now include a clause about "excessive use of technobabble" in engineering reports.`,
    () => `Crew member tried to use a sonic screwdriver; was reminded this is not Doctor Who.`,
    () => `Engineering team voted "Warp Core" as the best place for a surprise birthday party.`,
    () => `Chief Engineer insists that "reverse the polarity" is a valid troubleshooting step.`,
    () => `Crew member attempted to reroute power through the coffee maker; success remains unconfirmed.`,
    () => `Engineering team briefly considered using tribbles to clean plasma conduits; idea rejected.`,
    () => `Crew member's uniform was found to be magnetic; attracted all loose tools in Engineering.`,
    () => `Starfleet Command sent a congratulatory message for "most creative use of duct tape" in ship repairs.`,
    () => `Crew member attempted to install Windows 95 on the main computer core; system politely declined.`,
    () => `Engineering team held a warp core karaoke night; results classified.`,
    () => `Chief Engineer's pet targ briefly escaped into the Jefferies tubes; all is well.`,
    () => `Crew member programmed the replicator to serve only decaf; mutiny narrowly avoided.`,
    () => `Engineering team discovered a tribble nest in the sensor array; tribbles relocated to Science Lab.`,
    () => `Crew member attempted to use a tricorder as a universal remote; TV now only shows static.`,
    () => `Chief Engineer insists that "Have you tried turning it off and on again?" is Starfleet protocol.`
  ];
  // Track used humor phrases for this report
  const usedHumor = new Set<string>();
  // Helper to pick and evaluate a humor phrase
  function pickHumor(rnd:()=>number, used:Set<string>) {
    // Evaluate all humorPool entries to get their string values
    const allPhrases = humorPool.map(fn => fn());
    const available = allPhrases.filter(phrase => !used.has(phrase));
    const phrase = available.length > 0 ? pick(available, rnd) : allPhrases[0];
    used.add(phrase);
    return phrase;
  }
  // Senior ranks and roles for recipients
  const seniorRanks = ["Lieutenant Commander", "Commander", "Captain", "Commodore", "Rear Admiral", "Vice Admiral", "Admiral"];
  const seniorRoles = [
    "Senior Science Officer", "Chief Engineer", "Ship's Captain", "Director of Starfleet Engineering", "Associate Director, Starfleet R&D",
    "Department Head, Warp Systems", "Department Head, Structural Integrity", "Senior Operations Officer", "Head of Starfleet Technical Review",
    "Director of Starfleet Materials Science", "Senior Systems Analyst", "Chief of Starfleet Operations", "Director of Starbase Engineering"
  ];
  function makeRecipient(rnd: () => number) {
    const rank = seniorRanks[Math.floor(rnd() * seniorRanks.length)];
    const role = seniorRoles[Math.floor(rnd() * seniorRoles.length)];
    const first = pick(POOLS.crewFirst, rnd);
    const last = pick(POOLS.crewLast, rnd);
    return `${rank} ${first} ${last}, ${role}`;
  }
  // Helper to get vessel years
  function getVesselYears(vessel: string) {
    const found = STARFLEET_VESSELS.find(v => v.name === vessel);
    return found ? found.years : [2363, 2371]; // Default to Enterprise-D
  }
  // Track used humorous details to avoid repeats
  const usedBalancedDetails = new Set<string>();
  const usedAbsurdDetails = new Set<string>();
  
  // Ensure we have a valid seed
  const seedValue = cfg.seed || (cfg.signatoryName ? cfg.signatoryName + (cfg.stardate || "") : Date.now().toString());
  const seedNum = seedFromConfig(seedValue, cfg.signatoryName || cfg.stardate);
  const rnd = xorshift32(seedNum);
  const humor = cfg.humorLevel ?? 0;
  
  // Store the original seed for reproducibility
  const originalSeed = seedValue?.toString();
  
  // Use provided crew manifest if available
  // Crew manifest: random size if not provided
  const crewManifest = cfg.crewManifest && cfg.crewManifest.length ? [...cfg.crewManifest] : generateCrewManifest(typeof cfg.crewCount === 'number' ? cfg.crewCount : undefined, cfg.seed);

  // Generate technical jargon based on system type
  const generateTechJargon = (system: string): string => {
    const warpJargon = ["plasma flow regulator", "dilithium crystal alignment", "matter/antimatter reaction", "warp field harmonics", "power transfer conduits"];
    const epsJargon = ["power distribution network", "energy grid fluctuation", "transfer node stability", "conduit phase variance", "relay sequencer"];
    const sifJargon = ["field integrity matrix", "structural cohesion", "hull pressure distribution", "reinforcement grid", "stress compensator"];
    const deflectorJargon = ["emitter array calibration", "particle dispersion pattern", "subspace field modulation", "beam focus alignment", "output frequency"];
    const transporterJargon = ["pattern buffer synchronization", "confinement beam stability", "molecular imaging scanner", "quantum resolution filter", "matter stream cohesion"];
    const sensorJargon = ["subspace detection grid", "long-range scanner array", "spectral analysis matrix", "multi-phasic emission detector", "quantum flux variance monitor"];
    let jargonPool;
    const key = system.toLowerCase();
    if (key.includes("warp")) jargonPool = warpJargon;
    else if (key.includes("eps")) jargonPool = epsJargon;
    else if (key.includes("integrity") || key.includes("sif")) jargonPool = sifJargon;
    else if (key.includes("deflector")) jargonPool = deflectorJargon;
    else if (key.includes("transporter")) jargonPool = transporterJargon;
    else if (key.includes("sensor")) jargonPool = sensorJargon;
    else jargonPool = [...warpJargon, ...epsJargon, ...sifJargon, ...deflectorJargon, ...transporterJargon, ...sensorJargon];
    return pick(jargonPool, rnd);
  };

  // Distribute crew members across problems, 1-2 per problem, each mentioned once or twice
  const crewUsage: Record<number, number> = {};
  crewManifest.forEach((_, i) => crewUsage[i] = 0);
  const detailLevel = Math.max(1, Math.min(6, cfg.problemDetailLevel ?? 1));
  const problems = Array.from({length: cfg.problemsCount}, (_, i) => {
    // Pick 1 or 2 crew members for this problem, prioritizing those with least mentions
    let available = crewManifest.map((cm, idx) => ({cm, idx})).filter(({idx}) => crewUsage[idx] < 2);
    available = available.sort((a, b) => crewUsage[a.idx] - crewUsage[b.idx]);
    const nCrew = available.length > 1 ? (rnd() < 0.5 ? 2 : 1) : 1;
    // Crew role to system keyword mapping
    const roleKeywords: Record<string, string[]> = {
      "Sensor Technician": ["sensor"],
      "Warp Specialist": ["warp", "impulse", "antimatter", "coil", "reaction"],
      "EPS Engineer": ["eps", "power", "energy", "plasma", "junction", "relay"],
      "Structural Engineer": ["sif", "integrity", "hull", "reinforcement", "bulkhead", "frame", "lattice"],
      "Deflector Officer": ["deflector", "particle", "beam", "array", "dish", "grid"],
      "Transporter Chief": ["transporter", "pattern", "confinement", "biofilter", "enhancer", "matter stream"],
      "Operations": ["relay", "metrics", "calibration", "console", "monitor", "command"],
    };
    let sys = pick(POOLS.systems, rnd);
    // Extract main system keyword from sys
    const sysKey = sys.toLowerCase();
    let mainKeyword = "";
    const allKeywords = Object.values(roleKeywords).flat();
    for (let kw of allKeywords) {
      if (sysKey.includes(kw)) {
        mainKeyword = kw;
        break;
      }
    }
    // Assign crew whose role matches the main system keyword
    let assigned: {cm: CrewMember, idx: number}[] = [];
    if (mainKeyword) {
      for (let candidate of available) {
        const role = candidate.cm.role;
        if (roleKeywords[role] && roleKeywords[role].some(kw => mainKeyword === kw)) {
          assigned.push(candidate);
          if (assigned.length === nCrew) break;
        }
      }
    }
    // If not enough matches, fill with lowest usage
    if (assigned.length < nCrew) {
      for (let candidate of available) {
        if (!assigned.includes(candidate)) {
          assigned.push(candidate);
          if (assigned.length === nCrew) break;
        }
      }
    }
    assigned.forEach(({idx}) => crewUsage[idx]++);
    // Pick system based on crew role if possible
    if (assigned.length && roleKeywords[assigned[0].cm.role]) {
      const possible = roleKeywords[assigned[0].cm.role];
      for (let sysOption of POOLS.systems) {
        const sysOptionKey = sysOption.toLowerCase();
        if (possible.some(kw => sysOptionKey.includes(kw))) {
          sys = sysOption;
          break;
        }
      }
    }
    const crewNames = assigned.map(({cm}) => `${cm.rank} ${cm.name} (${cm.role})`).join(" & ");
    const title = `${sys} Issue`;
    // Problem summary: generate detailLevel sentences
    const sentences: string[] = [];
    for (let s = 0; s < detailLevel; s++) {
      if (s === 0) {
        const jargon = generateTechJargon(sys);
        const variance = (rnd() * 0.2 + 0.01).toFixed(2);
        const techDetails = `${jargon} experiencing a ${variance} phase variance`;
        sentences.push(`Detected anomaly in the ${sys.toLowerCase()} ${techDetails}. ${crewNames} performed diagnostic protocol and implemented corrective measures according to Starfleet regulation ${randint(1000, 9999, rnd)}-${String.fromCharCode(65 + Math.floor(rnd() * 26))}.`);
      } else {
        // Add plausible Star Trek flavor sentences, no repeats
        let humorPhrase;
        let humorText;
        let attempts = 0;
        do {
          humorPhrase = humorPool[Math.floor(rnd() * humorPool.length)];
          humorText = typeof humorPhrase === 'function' ? humorPhrase() : humorPhrase;
          attempts++;
        } while (usedHumor.has(humorText) && attempts < humorPool.length);
        usedHumor.add(humorText);
        sentences.push(humorText);
      }
    }
    let summary = sentences.join(' ');
    return { id: `p${i+1}`, title, summary };
  });

  // Generate relevant references based on the problems
  const refCount = randint(4, 10, rnd);
  // Helper to abbreviate ranks/titles
  function getRankAbbr(rank: string): string {
    if (!rank) return "";
    const map: Record<string, string> = {
      "Chief Petty Officer": "CPO",
      "Senior Chief Petty Officer": "SCPO",
      "Master Chief Petty Officer": "MCPO",
      "Ensign": "Ens.",
      "Lieutenant Junior Grade": "Lt. JG",
      "Lieutenant": "Lt.",
      "Lieutenant Commander": "Lt. Cmdr.",
      "Commander": "Cmdr.",
      "Doctor": "Doctor"
    };
    return map[rank] || rank;
  }
  // Helper to format names
  function formatName(first: string, last: string, rank?: string): string {
    return `${last}, ${first}${rank ? " " + getRankAbbr(rank) : ""}`;
  }
  // Generate references
  let references = Array.from({length: refCount}, (_, i) => {
    // Main author
    const first = pick(POOLS.crewFirst, rnd);
    const last = pick(POOLS.crewLast, rnd);
    let rank = pick(POOLS.crewRanks, rnd);
    if (randint(1,6,rnd) === 6) rank = "Doctor";
    const author = formatName(first, last, rank);
    // Co-authors logic
    let coAuthors: string[] = [];
    const coAuthorCount = (randint(1, 5, rnd) >= 4) ? randint(2, 3, rnd) : 0; // ~40% chance for co-authors
    for (let j = 0; j < coAuthorCount; j++) {
      // 1 in 3 chance to use signing engineer as co-author (if not already main author)
      if (cfg.signatoryReference && cfg.signatoryName && cfg.signatoryRank && randint(1,3,rnd) === 3) {
        let signatoryLast = cfg.signatoryName.split(" ").slice(-1)[0];
        let signatoryFirst = cfg.signatoryName.split(" ").slice(0, -1).join(" ");
        const signatoryAuthor = formatName(signatoryFirst, signatoryLast, cfg.signatoryRank);
        if (signatoryAuthor !== author && !coAuthors.includes(signatoryAuthor)) {
          coAuthors.push(signatoryAuthor);
          continue;
        }
      }
      // Otherwise random crew
      let coFirst = pick(POOLS.crewFirst, rnd);
      let coLast = pick(POOLS.crewLast, rnd);
      let coRank = pick(POOLS.crewRanks, rnd);
      if (randint(1,6,rnd) === 6) coRank = "Doctor";
      const coAuthor = formatName(coFirst, coLast, coRank);
      if (coAuthor !== author && !coAuthors.includes(coAuthor)) {
        coAuthors.push(coAuthor);
      }
    }
    const authorList = [author, ...coAuthors].join(", ");
    const relatedSystem = i < problems.length 
      ? problems[i].title.split(' ')[0] // Use the system from the problem if available
      : pick(POOLS.systems, rnd);
    const publicationType = pick([
      "Starfleet Technical Proceedings", 
      "Journal of Warp Mechanics", 
      "Federation Engineering Quarterly", 
      "Subspace Field Theory", 
      "Advanced Materials Science Review"
    ], rnd);
    const year = "23" + randint(50, 99, rnd);
    return {
      id: i + 1, 
      text: `${authorList} — *${relatedSystem} ${pick(["Diagnostics", "Maintenance", "Theory", "Applications", "Field Guide"], rnd)}*, ${publicationType}, ${year}.`
    };
  });
  // If signatoryReference is checked, add a reference with the signing engineer as author
  if (cfg.signatoryReference && cfg.signatoryName && cfg.signatoryRank) {
    // Format signatory name
    let signatoryLast = cfg.signatoryName.split(" ").slice(-1)[0];
    let signatoryFirst = cfg.signatoryName.split(" ").slice(0, -1).join(" ");
    const signatoryAuthor = formatName(signatoryFirst, signatoryLast, cfg.signatoryRank);
    references = [
      {
        id: 0,
        text: `${signatoryAuthor} — *Engineering Log: Starfleet Diagnostic Review*, Starfleet Technical Proceedings, 2371.`
      },
      ...references.map((r, idx) => ({ ...r, id: idx + 1 }))
    ];
  }

  // Pass humor level to global for chart captions
  (globalThis as any).__reportHumorLevel = humor;
  const figures: Figure[] = [];
  if (cfg.graphsEnabled) {
    const count = Math.max(1, Math.min(10, cfg.graphsCount ?? 3));
    for (let i=0; i<count; i++) {
      const p = problems[i % problems.length];
      figures.push(makeFigure(i, p.id, p.title, cfg.figureBias ?? "auto", rnd));
    }
  }
  delete (globalThis as any).__reportHumorLevel;
  delete (globalThis as any).__usedFigureCaptions;

  // Vessel and stardate logic
  const vessel = cfg.vessel || "Deep Space 9";
  const [yearStart, yearEnd] = getVesselYears(vessel);
  const year = yearStart + Math.floor(rnd() * (yearEnd - yearStart + 1));
  const month = 1 + Math.floor(rnd() * 12);
  const day = 1 + Math.floor(rnd() * 28);
  // Calculate day of year
  const daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
  let dayOfYear = day;
  for (let m = 1; m < month; m++) dayOfYear += daysInMonth[m-1];
  // Use standard stardate formula
  let stardateNum;
  if (year < 2323) {
    // TOS era
    stardateNum = 1000 * (year - 2323) + (dayOfYear / 365) * 1000;
  } else {
    // TNG/DS9/VOY era
    stardateNum = 41000 + (year - 2364) * 1000 + (dayOfYear / 365) * 1000;
  }
  // Use override if provided in cfg.stardate; accept raw number string or already-formatted
  const stardate = (cfg.stardate && cfg.stardate.toString().trim().length)
    ? (/^stardate/i.test(cfg.stardate.toString()) ? cfg.stardate.toString() : `Stardate ${cfg.stardate}`)
    : `Stardate ${stardateNum.toFixed(1)}`;

  // Reference generator
  function generateReferences(n: number): Reference[] {
    const authorRanks = [
      "Lt. Cmdr.", "Commander", "Captain", "Doctor", "Admiral", "Commodore", "Rear Admiral", "Vice Admiral",
      "Ambassador", "Subcommander", "Chief", "Specialist", "Director", "Fleet Captain", "Ensign", "Lieutenant", "Lieutenant JG", "Major", "Colonel",
      // Ferengi
      "DaiMon", "Liquidator", "Grand Nagus",
      // Vulcan
      "Subcommander", "High Priestess", "Science Minister",
      // Klingon
      "General", "Dahar Master", "Gowron", "Chancellor", "House Leader", "Captain", "Commander", "Warrior",
      // Cardassian
      "Gul", "Legate", "Glinn", "Dukat", "Enabran", "Agent"
    ];
    const authorTitles = [
      "Science Officer", "Chief Engineer", "Medical Officer", "Astrophysicist", "Systems Analyst", "Materials Scientist", "Operations Chief", "Research Director", "Department Head",
      "Starship Designer", "Warp Field Theorist", "Temporal Physicist", "Exobiologist", "Subspace Analyst", "Quantum Specialist", "Deflector Array Supervisor", "Transporter Chief", "Astrometrics Officer", "Holodeck Architect", "Starbase Administrator",
      // Ferengi
      "Commerce Authority", "Rules of Acquisition Scholar", "Profit Analyst",
      // Vulcan
      "Logic Instructor", "Kolinar Master", "Vulcan Science Directorate", "Mind Meld Specialist",
      // Klingon
      "House of Martok", "House of Mogh", "House of Duras", "Bat'leth Master", "Honor Guard", "Warrior", "Klingon High Council",
      // Cardassian
      "Obsidian Order", "Central Command", "Military Advisor", "Cardassian Science Ministry"
    ];
    const journals = [
      "Advanced Materials Science Review", "Starfleet Engineering Journal", "Federation Science Quarterly", "Subspace Mechanics Digest",
      "Journal of Warp Field Theory", "Starfleet Technical Orders", "Quantum Physics Review", "Starfleet Ship Systems Compendium",
      "Engineering Best Practices", "Starfleet Journal of Advanced Propulsion", "Deflector Array Maintenance Log", "Transporter Systems Analysis",
      "Proceedings of the Starfleet Engineering Symposium", "Vulcan Science Directorate Bulletin", "Klingon Imperial Engineering Review", "Romulan Technical Compendium",
      "Bajor Institute of Technology Journal", "Ferengi Commerce Authority Technical Circular", "Starfleet R&D Conference Proceedings", "Federation Shipwrights Annual", "Starfleet Materials Science Digest", "Starfleet Systems Integration Review", "Starfleet Academy Engineering Thesis Series"
    ];
    const famousAuthors = [
      "Geordi La Forge", "Montgomery Scott", "Miles O'Brien", "B'Elanna Torres", "Jadzia Dax", "Spock", "Sarek", "Sybok", "Saavik", "Ezri Dax", "Nog", "Martok", "Worf", "Alexander Rozhenko",
      "Keiko O'Brien", "Sela", "Barclay", "Trip Tucker", "Hoshi Sato", "Malcolm Reed", "Archer", "Shran", "T'Pau", "Morn", "Quark", "Odo", "Garak", "Dukat", "K'Ehleyr", "Talax", "Neelix", "Kes", "Silik", "Soval", "Trelane", "Gowron", "Lorca", "Saru", "Burnham", "Narek", "Noss", "Jeyal", "Tuvix", "Leeta", "Rom", "Icheb", "Vorik", "Evek", "Seska", "Jem'Hadar", "Weyoun", "Brunt", "Damar", "Ezral", "Tosk", "Hugh", "Soji", "Narissa", "Elim Garak", "Vash", "Ziyal", "Tora Ziyal", "Bareil Antos", "Shinzon"
    ];
    function randomStardate(maxYear: number) {
      // Pick a random year/month/day within allowed range
      const refYear = randint(2300, maxYear, rnd);
      const refMonth = 1 + Math.floor(rnd() * 12);
      const refDay = 1 + Math.floor(rnd() * 28);
      // Calculate day of year
      const daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
      let dayOfYear = refDay;
      for (let m = 1; m < refMonth; m++) dayOfYear += daysInMonth[m-1];
      // Stardate formula
      let stardateNum;
      if (refYear < 2323) {
        stardateNum = 1000 * (refYear - 2323) + (dayOfYear / 365) * 1000;
      } else {
        stardateNum = 41000 + (refYear - 2364) * 1000 + (dayOfYear / 365) * 1000;
      }
      return stardateNum.toFixed(1);
    }
    return Array.from({length: n}, (_, i) => {
      const numAuthors = 1 + Math.floor(rnd() * 3);
      const authors = Array.from({length: numAuthors}, () => {
        // 1 in 3 chance to use a famous author
        if (rnd() < 0.33) {
          // Famous author: split into first/last if possible
          const famous = pick(famousAuthors, rnd);
          const rank = pick(authorRanks, rnd);
          const title = pick(authorTitles, rnd);
          let first = famous, last = "";
          if (famous.includes(" ")) {
            const parts = famous.split(" ");
            last = parts[parts.length-1];
            first = parts.slice(0, -1).join(" ");
          } else {
            last = famous;
            first = "";
          }
          return `${last}, ${first} ${rank}, ${title}`.replace(/  /g, " ").trim();
        } else {
          const rank = pick(authorRanks, rnd);
          const first = pick(POOLS.crewFirst, rnd);
          const last = pick(POOLS.crewLast, rnd);
          const title = pick(authorTitles, rnd);
          return `${last}, ${first} ${rank}, ${title}`;
        }
      });
      const refTitle = pick(POOLS.references, rnd);
      const journal = pick(journals, rnd);
      const refStardate = randomStardate(year);
      // Add division and publication type for realism
      const division = pick([
        "Engineering Division", "Science Division", "Operations Division", "Medical Division", "Astrometrics", "Starbase Engineering", "Starfleet R&D", "Federation Shipwrights", "Vulcan Science Directorate", "Klingon Imperial Engineering", "Romulan Technical Bureau"
      ], rnd);
      const pubType = pick([
        "Technical Bulletin", "Journal Article", "Conference Paper", "Symposium Proceedings", "Maintenance Log", "Field Guide", "Thesis", "Review", "Compendium", "Annual Report"
      ], rnd);
      return {
        id: i+1,
        text: `[${i+1}] ${authors.join(", ")} — *${refTitle}* (${pubType}), ${journal}, ${division}, Stardate: ${refStardate}`
      };
    });
  }

  const report: Report = {
    header: { 
      stardate, 
      vessel, 
      preparedBy: {
        name: cfg.signatoryName, 
        rank: cfg.signatoryRank, 
        division: "Engineering"
      }, 
      submittedTo: "Starfleet Corps of Engineers", 
      toRecipient: makeRecipient(rnd),
      ccRecipient: makeRecipient(rnd),
      title: `${vessel} Engineering Report`
    },
    abstract: generateAbstract(problems, humor, rnd),
    problems,
    conclusion: generateConclusion(problems, humor, rnd),
    references: generateReferences(3 + Math.floor(rnd()*8)),
    figures,
    crewManifest,
    humorLevel: humor,
    figureBias: cfg.figureBias || "auto",
    originalSeed: originalSeed, // Use our enhanced seed tracking
    problemDetailLevel: cfg.problemDetailLevel || 3
  };
  return report;
}

// Generate appropriate abstract based on humor level and problems
function generateAbstract(problems: any[], humorLevel: number, rnd: () => number): string {
  // Pluralize generic system names
  function pluralizeSystem(name: string): string {
    // If name is already plural or is specific, return as is
    if (/s$|array|field|grid|core|chamber|unit|device|drive|buffer|collector|matrix|pack|assembly|transceiver|shielding|slipstream|containment|dampeners|emitters|modulator|regulator|station|yard|beam|computer|core|power|holodeck|tractor|auxiliary|deflector|sensor/i.test(name)) return name;
    // Common singulars to pluralize
    if (name === "Shield") return "Shields";
    if (name === "Sensor") return "Sensors";
    if (name === "EPS Manifold") return "EPS Manifolds";
    if (name === "Impulse Engine") return "Impulse Engines";
    if (name === "Bussard Collector") return "Bussard Collectors";
    if (name === "Plasma Conduit") return "Plasma Conduits";
    if (name === "Navigational Deflector") return "Navigational Deflectors";
    if (name === "Transporter Buffer") return "Transporter Buffers";
    if (name === "Dilithium Chamber") return "Dilithium Chambers";
    if (name === "Anti-Matter Containment") return "Anti-Matter Containments";
    if (name === "Structural Integrity Field") return "Structural Integrity Fields";
    if (name === "Inertial Dampener") return "Inertial Dampeners";
    // Default: add 's' if not ending in 's'
    if (!name.endsWith('s')) return name + 's';
    return name;
  }
  // Use full system names from POOLS.systems for natural phrasing
  const getFullSystemName = (title: string) => {
    const lower = title.toLowerCase();
    const match = Object.values(POOLS.systems).find(s => lower === s.toLowerCase() || lower.includes(s.toLowerCase().split(' ')[0]));
    return match || title;
  };
  const systemsMentioned = problems.map(p => getFullSystemName(p.title.replace(/ Issue$/, ''))).filter((v, i, a) => a.indexOf(v) === i);
  const systemList = systemsMentioned.length > 1
    ? systemsMentioned.slice(0, -1).join(', ') + ' and ' + systemsMentioned[systemsMentioned.length - 1]
    : systemsMentioned[0];
  const vessel = (globalThis as any).__reportVessel || "the vessel";
  const crewNames = (globalThis as any).__reportCrewNames || "engineering team";
  if (humorLevel <= 2) {
    // Dry technical, multi-sentence
    return `During routine operations aboard ${vessel}, anomalies were detected in the ${systemList}. Diagnostic procedures were conducted according to Starfleet Engineering Protocol ${randint(100, 999, rnd)}-${String.fromCharCode(65 + Math.floor(rnd() * 26))}. All issues have been addressed and systems are now functioning within acceptable parameters. Continued monitoring is recommended. Engineering team will review system logs and schedule additional diagnostics as needed.`;
  } else if (humorLevel <= 7) {
    // Balanced, multi-sentence
    return `This report documents ${problems.length} engineering ${problems.length === 1 ? 'anomaly' : 'anomalies'} encountered in the ${systemList} during standard operations aboard ${vessel}. Engineering staff diagnosed and implemented corrective measures with minimal disruption to ship functions. Post-repair diagnostics indicate all systems are now operating within Starfleet specifications. Crew members involved in repairs have logged recommendations for future maintenance. Mission readiness is confirmed.`;
  } else {
    // Absurd, multi-sentence
    const absurdIntros = [
      `What started as a perfectly ordinary day aboard ${vessel} quickly turned into an engineering adventure involving`,
      `In what can only be described as an impressive display of Murphy's Law, the following systems decided to simultaneously express their creativity:`,
      `This report documents what happens when you let ensigns near the`,
      `After what was definitely NOT caused by that card game in engineering last night, we had to address issues with the`
    ];
    const absurdOutros = [
      `Despite the ${pick(['chaos', 'excitement', 'unexpected challenges', 'creative interpretations of physics'], rnd)}, our engineering team has heroically restored order to the ${pick(['universe', 'quadrant', 'ship', 'department'], rnd)}. Crew morale remains high, and the replicators are only slightly misbehaving.`,
      `The crew now recommends a ship-wide ban on unsupervised holodeck programs and all forms of cheese near plasma relays. All systems are nominal, but the warp core is humming the theme from "The Pirates of Penzance."`,
      `Engineering morale remains high, though the replicators are still refusing to produce anything but lukewarm stew. All repairs are logged for future reference.`,
      `All systems are nominal, but the ship now hums slightly off-key when exceeding Warp ${randint(5, 8, rnd)}. Engineering has decided to call this a "feature" rather than a "bug."` 
    ];
    return `${pick(absurdIntros, rnd)} ${systemList}. ${pick(absurdOutros, rnd)}`;
  }
}

// Generate appropriate conclusion based on humor level and problems
function generateConclusion(problems: any[], humorLevel: number, rnd: () => number): string {
  // Use full system names from POOLS.systems for natural phrasing
  const getFullSystemName = (title: string) => {
    const lower = title.toLowerCase();
    const match = Object.values(POOLS.systems).find(s => lower === s.toLowerCase() || lower.includes(s.toLowerCase().split(' ')[0]));
    return match || title;
  };
  const vessel = (globalThis as any).__reportVessel || "the vessel";
  const crewNames = (globalThis as any).__reportCrewNames || "engineering team";
  const systemsMentioned = problems.map(p => getFullSystemName(p.title.replace(/ Issue$/, ''))).filter((v, i, a) => a.indexOf(v) === i);
  const systemList = systemsMentioned.length > 1
    ? systemsMentioned.slice(0, -1).join(', ') + ' and ' + systemsMentioned[systemsMentioned.length - 1]
    : systemsMentioned[0];
  if (humorLevel <= 2) {
    // Dry technical, multi-sentence
    return `All reported anomalies in the ${systemList} have been successfully addressed. Systems have been recalibrated to operate within Starfleet specifications. It is recommended that routine monitoring continue for the next ${randint(3, 5, rnd)} duty cycles to ensure stabilization. Maintenance schedule has been updated accordingly in the engineering database. Engineering team will review system logs and schedule additional diagnostics as needed.`;
  } else if (humorLevel <= 7) {
    // Balanced, multi-sentence
    return `All identified issues have been resolved and the ${systemList} are now functioning within normal parameters. The engineering team recommends implementing a ${randint(2, 7, rnd)}-hour diagnostic cycle for the affected systems over the next ${randint(3, 10, rnd)} days to ensure long-term stability. Crew members have logged recommendations for future maintenance. Mission operations may proceed without restriction. Continued vigilance is advised.`;
  } else {
    // Absurd, multi-sentence
    const absurdConclusions = [
      `All systems are now functioning as intended, though the ${pick(['warp core', 'computer', 'replicator', 'transporter'], rnd)} seems a bit sulky. Engineering recommends speaking to it nicely for the next few days. Crew morale remains high, and the replicators are only slightly misbehaving.`,
      `Problems solved! We're as surprised as you are. Recommend celebrating with synthehol all around, preferably not near any of the systems mentioned in this report. All repairs are logged for future reference.`,
      `Everything's fixed, Captain! That said, if anyone asks where that spare ${pick(['dilithium crystal', 'power coupling', 'phase discriminator', 'quantum flux capacitor'], rnd)} went, we know nothing. All systems are nominal, but the ship now hums slightly off-key when exceeding Warp ${randint(5, 8, rnd)}. Engineering has decided to call this a "feature" rather than a "bug."`,
      `All repairs complete. The ship is now 17% more likely to survive a temporal anomaly, according to the computer. Engineering team requests permission to take the rest of the day off, unless the holodeck malfunctions again.`
    ];
    return pick(absurdConclusions, rnd);
  }
}

export function reportToTxt(r: Report): string {
  const L: string[] = [];
  L.push(`# ${r.header.title}`);
  L.push(`Stardate: ${r.header.stardate}`);
  L.push(`Vessel: ${r.header.vessel}`);
  L.push(`Prepared By: ${r.header.preparedBy.rank} ${r.header.preparedBy.name}, Engineering`);
  L.push(`Submitted To: ${r.header.submittedTo}`);
  L.push("");
  L.push("Abstract");
  L.push(r.abstract);
  L.push("");

  r.problems.forEach((p,i)=>{
    L.push(`Problem ${i+1}: ${p.title}`);
    L.push(p.summary);
    const figs = (r.figures||[]).filter(f=>f.sectionAnchor===p.id);
    if (figs.length) {
      L.push(`Figures:`);
      figs.forEach(f => L.push(`- ${f.id}: ${f.title} — ${f.caption}`));
    }
    L.push("");
  });

  L.push("Conclusion");
  L.push(r.conclusion);
  L.push("");

  if (r.crewManifest && r.crewManifest.length) {
    L.push("Crew Manifest (Mentioned)");
    r.crewManifest.forEach(cm => L.push(`- ${cm.rank} ${cm.name}, ${cm.role}`));
    L.push("");
  }

  L.push("References");
  (r.references||[]).forEach(ref=>L.push(`[${ref.id}] ${ref.text}`));
  return L.join("\n");
}
