// Starfleet vessels and their active years
export const STARFLEET_VESSELS = [
  { name: "USS Enterprise NCC-1701", years: [2245, 2285] },
  { name: "USS Enterprise NCC-1701-B", years: [2293, 2296] },
  { name: "USS Enterprise NCC-1701-D", years: [2363, 2371] },
  { name: "USS Reliant NCC-1864", years: [2278, 2285] },
  { name: "USS Excelsior NCC-2000", years: [2285, 2320] },
  { name: "USS Stargazer NCC-2893", years: [2333, 2348] },
  { name: "USS Sutherland NCC-72015", years: [2367, 2371] },
  { name: "USS Defiant NX-74205", years: [2370, 2375] },
  { name: "USS Voyager NCC-74656", years: [2371, 2378] },
  { name: "USS Grissom NCC-638", years: [2285, 2285] },
  { name: "USS Yamato NCC-71807", years: [2365, 2366] },
  { name: "USS Prometheus NX-59650", years: [2374, 2379] },
  { name: "USS Titan NCC-80102", years: [2379, 2384] },
  { name: "USS Equinox NCC-72381", years: [2370, 2375] },
  { name: "USS Pasteur NCC-58925", years: [2385, 2385] },
];
export type Rank = "Chief Petty Officer" | "Senior Chief Petty Officer" | "Master Chief Petty Officer" | "Ensign" | "Lieutenant Junior Grade" | "Lieutenant" | "Lieutenant Commander" | "Commander";

export interface GeneratorConfig {
  problemsCount: 1|2|3|4|5;
  graphsEnabled: boolean;
  graphsCount?: number;
  signatoryName: string;
  signatoryRank: Rank;
  signatoryReference?: boolean;
  vessel: string;
  stardate: string;
  seed?: string | number;
  humorLevel?: number;
  figureBias?: FigureBias;
  crewCount?: number; // Added for crew manifest control
  problemDetailLevel?: number; // Number of sentences per problem
  missionTemplate?: MissionTemplate; // Content bias template (Phase 1)
  allowCanonNames?: boolean; // Whether to allow famous canon names in references
  filterCanonByEra?: boolean; // Whether to filter canon names by vessel era
  famousAuthorFrequency?: FamousAuthorFrequency; // Frequency control for famous authors in references
  famousRecentMemory?: number; // LRU size to reduce repeat famous authors (0 = no memory)
  customProblemTitles?: string[]; // Custom problem titles (e.g., from warp core game)
  customProblemDurations?: number[]; // Duration in seconds for each custom problem
  stardateMode?: StardateMode; // Stardate calculation mode (simple = 1000/year, canon = 918.23/year)
}

export interface ProblemSection { id: string; title: string; summary: string; }
export interface Reference { id: number; text: string }

export interface Report {
  header: {
    stardate: string;
    vessel: string;
    preparedBy: { name: string; rank: Rank; division: string };
    submittedTo: string;
    toRecipient: string;
    ccRecipient: string;
    title: string;
  };
  abstract: string;
  problems: ProblemSection[];
  conclusion: string;
  references: Reference[];
  figures?: Figure[];
  crewManifest?: CrewMember[];
  humorLevel?: number;
  figureBias?: FigureBias;
  originalSeed?: string; // Add original seed to enable recreation of the same report
  problemDetailLevel?: number; // Store the problem detail level for recreation
}

export type FigureType = "line" | "bar" | "scatter" | "gauge" | "pie" | "area" | "radar" | "heatmap" | "step" | "boxplot";

export interface Figure {
  id: string;
  index?: number;
  title: string;
  type: FigureType;
  data: any;
  caption: string;
  sectionAnchor?: string;
  displayId?: string;
}

export interface CrewMember { name: string; rank: string; role: string; }

export type FigureBias = "auto" | "warp" | "eps" | "sif" | "deflector" | "transporter" | "inertial";

// Mission Templates bias content selection without changing control values
export type MissionTemplate = "none" | "incident" | "survey" | "maintenance" | "shakedown";

// Frequency control for famous/canon author appearances
export type FamousAuthorFrequency = "off" | "rare" | "occasional" | "frequent";

// Stardate calculation mode
export type StardateMode = "simple" | "canon";
