export function pick<T>(arr:T[], rnd:()=>number) { return arr[Math.floor(rnd()*arr.length)] }

// Prevents crew names like "Barclay Barclay" or "Riker Riker"
export function pickCrewName(rnd:()=>number) {
  let first = pick(POOLS.crewFirst, rnd);
  let last = pick(POOLS.crewLast, rnd);
  // Try up to 5 times to avoid duplicates
  let attempts = 0;
  while (first === last && attempts < 5) {
    last = pick(POOLS.crewLast, rnd);
    attempts++;
  }
  return `${first} ${last}`;
}
export function randint(min:number,max:number,rnd:()=>number) { return Math.floor(rnd()*(max-min+1))+min }
export function hashCode(str:string){ let h=0; for(let i=0;i<str.length;i++){ h=(h<<5)-h+str.charCodeAt(i); h|=0;} return Math.abs(h)}
export function xorshift32(seed:number){ let x=seed||2463534242; return ()=>{ x^=x<<13; x^=x>>>17; x^=x<<5; return (x>>>0)/4294967296; } }

export const POOLS = { 
  crewRanks: [
    "Chief Petty Officer", "Senior Chief Petty Officer", "Master Chief Petty Officer",
    "Ensign", "Lieutenant Junior Grade", "Lieutenant", "Lieutenant Commander", "Commander"
  ],
  crewRoles: [
    "Diagnostic Specialist", "Warp Systems Tech", "EPS Conduit Tech", "Field Modulation Analyst",
    "Engineer", "Impulse Drive Specialist", "Dilithium Crystal Calibrator", "Structural Integrity Monitor",
    "Plasma Flow Regulator", "Deflector Control Officer", "Transporter Systems Technician",
    "Shield Harmonic Analyst", "Subspace Field Specialist", "Quantum Flux Technician",
    "Temporal Mechanics Analyst", "Nanite Supervisor", "Quantum Slipstream Engineer", "Graviton Field Technician",
    "Subspace Anomaly Investigator", "Holodeck Safety Officer", "Astrometrics Specialist", "Bio-neural Gel Pack Maintainer"
  ],
  vessels: [
    "USS Venture", "USS Dauntless", "USS Excelsior", "USS Defiant", "USS Voyager",
    "USS Enterprise-E", "USS Titan", "USS Reliant", "USS Sovereign", "USS Prometheus",
    "Starbase 173", "Deep Space 9", "Utopia Planitia Yards", "Jupiter Station",
    "USS Discovery", "USS Cerritos", "USS Stargazer", "USS Grissom", "USS Hood",
    "USS Yamato", "USS Lexington", "USS Bozeman", "USS Pasteur", "USS Franklin",
    "Starbase 375", "Regula I", "Starbase 11", "Starbase 24"
  ],
  systems: [
    "Warp Core", "EPS Manifold", "Structural Integrity Field", "Inertial Dampeners",
    "Deflector Array", "Shield Generators", "Transporter Buffers", "Bussard Collectors",
    "Impulse Engines", "Sensor Array", "Navigational Deflector", "Dilithium Chamber",
    "Plasma Conduits", "Anti-Matter Containment", "Graviton Emitter Array", "Subspace Transceiver",
    "Bio-neural Gel Packs", "Quantum Slipstream Drive", "Temporal Shielding", "Holodeck Grid",
    "Tractor Beam Assembly", "Cloaking Device", "Computer Core", "Auxiliary Power Unit"
  ],
  crewFirst: [
  "Marissa", "Jonathan", "T'Vel", "Korath", "William", "Beverly", "Geordi", "Tasha",
  "Jean-Luc", "Deanna", "Miles", "Jadzia", "Julian", "Kira", "Benjamin", "Kathryn",
  "Chakotay", "B'Elanna", "Tuvok", "Seven", "Harry", "Thomas", "Nyota", "Montgomery",
  "Pavel", "Hikaru", "Leonard", "Christine", "Janice", "Wesley", "Ro", "Reginald",
  "Spock", "Sarek", "Sybok", "Saavik", "Ezri", "Nog", "Martok", "Worf", "Alexander",
  "Keiko", "Sela", "Barclay", "Trip", "Hoshi", "Malcolm", "Archer",
  // Added non-human and themed names
  "Shran", "T'Pau", "Morn", "Quark", "Odo", "Garak", "Dukat", "K'Ehleyr", "Talax", "Neelix", "Kes", "Silik", "Soval", "Trelane", "Gowron", "Lorca", "Saru", "Burnham", "Narek", "Noss", "Jeyal", "Tuvix", "Leeta", "Rom", "Icheb", "Vorik", "Evek", "Seska", "Jem'Hadar", "Weyoun", "Brunt", "Damar", "Ezral", "Tosk", "Hugh", "Soji", "Narissa", "Elim", "Vash", "Ziyal", "Tora", "Bareil", "Shinzon", "Tormek",
  // Ferengi
  "Quark", "Rom", "Nog", "Brunt", "Gaila", "Leck", "Zek", "Krax", "Maihar'du", "Pel",
  // Vulcan
  "Spock", "Sarek", "T'Pol", "Tuvok", "T'Pau", "Sybok", "Saavik", "Stonn", "Soval", "T'Pring", "T'Lar", "Solok", "T'Rul",
  // Klingon
  "Worf", "Martok", "Gowron", "Kurn", "Kor", "Koloth", "Kang", "Duras", "B'Elanna", "K'Ehleyr", "Lursa", "B'Etor", "Grilka", "Mogh", "Toral", "Klag", "Kurn", "K'Temoc",
  // Cardassian
  "Garak", "Dukat", "Tain", "Ziyal", "Damar", "Evek", "Gul", "Makbar", "Korinas", "Rakal", "Tekeny", "Natima", "Enabran", "Ghemor", "Rusot"
  ],
  crewLast: [
  "Noble", "Hale", "Picard", "Riker", "Crusher", "La Forge", "Yar", "Troi", "O'Brien",
  "Dax", "Bashir", "Nerys", "Sisko", "Janeway", "Torres", "Kim", "Paris", "Uhura",
  "Scott", "Chekov", "Sulu", "McCoy", "Chapel", "Rand", "Laren", "Barclay",
  "T'Pol", "Tucker", "Archer", "Mayweather", "Sato", "Reed", "Phlox",
  "Spock", "Sarek", "Sybok", "Saavik", "Ezri", "Nog", "Martok", "Worf", "Alexander",
  "Keiko", "Sela", "Barclay", "Trip", "Hoshi", "Malcolm", "Crusher",
  // Added non-human and themed last names
  "Shran", "T'Pau", "Morn", "Quark", "Odo", "Garak", "Dukat", "K'Ehleyr", "Talax", "Neelix", "Kes", "Silik", "Soval", "Trelane", "Gowron", "Lorca", "Saru", "Burnham", "Narek", "Noss", "Jeyal", "Tuvix", "Leeta", "Rom", "Icheb", "Vorik", "Evek", "Seska", "Jem'Hadar", "Weyoun", "Brunt", "Damar", "Ezral", "Tosk", "Hugh", "Soji", "Narissa", "Elim", "Vash", "Ziyal", "Tora", "Bareil", "Shinzon",
  // Ferengi
  "Quark", "Rom", "Nog", "Brunt", "Gaila", "Leck", "Zek", "Krax", "Maihar'du", "Pel",
  // Vulcan
  "Spock", "Sarek", "T'Pol", "Tuvok", "T'Pau", "Sybok", "Saavik", "Stonn", "Soval", "T'Pring", "T'Lar", "Solok", "T'Rul",
  // Klingon
  "Worf", "Martok", "Gowron", "Kurn", "Kor", "Koloth", "Kang", "Duras", "B'Elanna", "K'Ehleyr", "Lursa", "B'Etor", "Grilka", "Mogh", "Toral", "Klag", "Kurn", "K'Temoc",
  // Cardassian
  "Garak", "Dukat", "Tain", "Ziyal", "Damar", "Evek", "Gul", "Makbar", "Korinas", "Rakal", "Tekeny", "Natima", "Enabran", "Ghemor", "Rusot"
  ],
  jargon: [
    "EPS manifold phase variance", "plasma coil inversion", "structural integrity dampening field fluctuations",
    "dilithium matrix realignment", "subspace harmonic resonance", "quantum flux instability",
    "graviton polarity shift", "bio-neural gel pack desynchronization", "inertial dampener recalibration",
    "deflector array modulation", "transporter buffer phase drift", "Bussard collector contamination",
    "impulse engine plasma backflow", "sensor array subspace echo", "navigational deflector misalignment",
    "anti-matter containment breach warning", "holodeck grid power surge", "tractor beam harmonic feedback",
    "computer core memory leak", "auxiliary power unit overload", "temporal shielding phase error",
    "quantum slipstream drive instability", "subspace transceiver signal loss", "cloaking device phase shift"
  ],
  references: [
    "Starfleet Engineering Manual",
    "Journal of Warp Field Theory",
    "EPS Conduit Safety Bulletin",
    "Structural Integrity Field Review",
    "Starfleet Technical Orders",
    "Federation Science Quarterly",
    "Starfleet Operations Handbook",
    "Subspace Mechanics Digest",
    "Quantum Physics Review",
    "Starfleet Ship Systems Compendium",
    "Engineering Best Practices",
    "Starfleet Journal of Advanced Propulsion",
    "Deflector Array Maintenance Log",
    "Transporter Systems Analysis",
    "Starfleet Materials Science",
    "Starfleet Engineering Symposium Proceedings"
  ]
};

export function humorousAside(level:number, rnd:()=>number): string {
  if (level<=0) return "";
  const chance = Math.min(0.05 + level*0.04, 0.5);
  if (rnd() > chance) return "";
  const bits = [
    "Replicators briefly produced lukewarm stew when 'chocolate sundae' was requested.",
    "A tribble was discovered asleep on the phase discriminator; gently relocated.",
    "Coffee in Engineering reaffirmed as mission-critical resource.",
    "Bussard collectors reported traces of glitter; cause unknown, morale high.",
    "Environmental controls in Ten Forward switched to Risa climate for 3.5 minutes.",
    "Holodeck 2 briefly displayed images of 20th century cartoon characters.",
    "Counselor suggested team-building exercises; Engineering declined with impressive solidarity.",
    "Unexpected harmonic vibrations in Deck 12 resulted in spontaneous crew dance party.",
    "Automated voice interface referred to Captain as 'Your Majesty' for one duty shift.",
    "Experimental sensor calibration picked up subspace transmission of what appears to be Klingon opera.",
    "Lieutenant's coffee mug found to contain dilithium-infused blend; warp-speed alertness reported."
  ];
  return bits[Math.floor(rnd()*bits.length)];
}

export function seedFromConfig(seed?: string|number, fallbackKey?: string) {
  if (typeof seed === "number") return Math.abs(seed|0) || 2463534242;
  if (typeof seed === "string" && seed.trim().length>0) return hashCode(seed.trim());
  if (fallbackKey && fallbackKey.trim().length>0) return hashCode(fallbackKey.trim());
  return 2463534242;
}
