import React, { useState } from "react";
import { GeneratorConfig, Rank, STARFLEET_VESSELS } from "../types";
import { pick, hashCode, xorshift32, POOLS, pickCrewName } from "../utils/helpers";

const ranks: Rank[] = [
  "Chief Petty Officer","Senior Chief Petty Officer","Master Chief Petty Officer",
  "Ensign","Lieutenant Junior Grade","Lieutenant","Lieutenant Commander","Commander"
];

export default function ReportControls({ onGenerate, onPreviewCrew, onRegenerate, manifestPanelOpen }: {
  onGenerate: (cfg: GeneratorConfig) => void,
  onPreviewCrew: (count?:number, seed?:string)=>void,
  onRegenerate?: () => void,
  manifestPanelOpen?: boolean
}) {
  const [problemsCount, setProblemsCount] = useState<1|2|3|4|5>(3);
  const [problemDetailLevel, setProblemDetailLevel] = useState<number>(2);
  const [graphsEnabled, setGraphsEnabled] = useState(true);
  const [graphsCount, setGraphsCount] = useState(3);
  const [signatoryName, setSignatoryName] = useState("Craig Bickford");
  const [signatoryRank, setSignatoryRank] = useState<Rank>("Lieutenant Commander");
  const [vessel, setVessel] = useState<string>(STARFLEET_VESSELS[0].name);
  const [seed, setSeed] = useState<string>("");
  const [seedLocked, setSeedLocked] = useState<boolean>(false);
  const [lastRandomSeed, setLastRandomSeed] = useState<string>("");
  const [humor, setHumor] = useState<number>(5);
  const [signatoryReference, setSignatoryReference] = useState<boolean>(false);

  const handleRandomName = () => {
  const rnd = xorshift32(Math.floor(Math.random() * 1e9));
  setSignatoryName(pickCrewName(rnd));
  };

  const handleRandomSeed = () => {
    const s = Math.floor(Math.random() * 1e9).toString(36);
    setLastRandomSeed(s);
    if (!seedLocked) setSeed(s);
  };

  const toggleSeedLock = () => {
    // Quick toggle between last random seed and a fixed one
    if (!seedLocked) {
      // Lock current seed (use lastRandomSeed if present)
      setSeed(prev => prev || lastRandomSeed || Math.floor(Math.random()*1e9).toString(36));
      setSeedLocked(true);
    } else {
      // Unlock and restore lastRandomSeed into the field for convenience
      setSeed(lastRandomSeed);
      setSeedLocked(false);
    }
  };

  const generate = () => {
    const cfg: GeneratorConfig = {
      problemsCount,
      graphsEnabled,
      graphsCount: graphsEnabled ? graphsCount : undefined,
      signatoryName,
      signatoryRank,
      vessel,
      seed: seed || undefined,
      humorLevel: humor,
      signatoryReference,
      problemDetailLevel,
      stardate: ""
    };
    onGenerate(cfg);
  };

  // Add preview crew manifest button
  const previewCrew = () => {
    // Use onPreviewCrew callback with no fixed count to let App.tsx handle the random sizing
    onPreviewCrew(undefined, seed);
  };

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-6">
  <div className="lcars-card">
        <div className="lcars-rail"></div>
  <div className="lcars-body">
          <label className="lcars-label">Problems</label>
          <input type="range" min={1} max={5} value={problemsCount} onChange={(e)=>setProblemsCount(parseInt(e.target.value) as any)} />
          <div className="lcars-small">{problemsCount}</div>
          <label className="lcars-label mt-2">Problem Detail Level</label>
          <input type="range" min={1} max={6} value={problemDetailLevel} onChange={e=>setProblemDetailLevel(parseInt(e.target.value))} />
          <div className="lcars-small">{problemDetailLevel} sentence{problemDetailLevel > 1 ? "s" : ""} per problem</div>
        </div>
      </div>

      <div className="lcars-card">
        <div className="lcars-rail lcars-rail-alt"></div>
        <div className="lcars-body">
          <label className="lcars-label">Graphs</label>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={graphsEnabled} onChange={e=>setGraphsEnabled(e.target.checked)} />
            <span className="lcars-small">Enable</span>
          </div>
          {graphsEnabled && <>
            <label className="lcars-label mt-2">How many (1–10)</label>
            <input type="range" min={1} max={10} value={graphsCount} onChange={(e)=>setGraphsCount(parseInt(e.target.value))} />
            <div className="lcars-small">{graphsCount}</div>
          </>}
        </div>
      </div>

      <div className="lcars-card">
        <div className="lcars-rail lcars-rail-accent"></div>
        <div className="lcars-body space-y-2">
          <label className="lcars-label">Starship</label>
          <select value={vessel} onChange={e=>setVessel(e.target.value)} className="lcars-input">
            {STARFLEET_VESSELS.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
          </select>
          <label className="lcars-label mt-2">Signing Engineer</label>
          <div className="flex gap-2">
            <input type="text" value={signatoryName} onChange={e=>setSignatoryName(e.target.value)} className="lcars-input flex-1" />
            <button onClick={handleRandomName} className="lcars-btn">🎲</button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="signatoryReference"
              checked={signatoryReference}
              onChange={e => setSignatoryReference(e.target.checked)}
            />
            <label htmlFor="signatoryReference" className="lcars-label">
              Add Signatory Reference
            </label>
          </div>
          <label className="lcars-label">Rank</label>
          <select value={signatoryRank} onChange={e=>setSignatoryRank(e.target.value as Rank)} className="lcars-input">
            {ranks.map(r=><option key={r}>{r}</option>)}
          </select>

          <label className="lcars-label">Seed</label>
          <div className="flex gap-2">
            <input type="text" value={seed} onChange={e=>setSeed(e.target.value)} className="lcars-input flex-1" placeholder="optional" />
            <button onClick={handleRandomSeed} className="lcars-btn" title="Random seed">🎲</button>
            <button onClick={toggleSeedLock} className={"lcars-btn " + (seedLocked ? "lcars-btn-locked" : "")} title="Lock/Unlock seed">{seedLocked ? "🔒" : "🔓"}</button>
          </div>

          <label className="lcars-label">Figure Bias</label>
            <select onChange={e=>onGenerate({
              problemsCount, graphsEnabled, graphsCount: graphsEnabled ? graphsCount : undefined, signatoryName, signatoryRank,
              vessel: pick(POOLS.vessels, xorshift32(hashCode(seed || signatoryName))), stardate: (50000 + Math.random()*9999).toFixed(1), seed: seed || undefined, humorLevel: humor, figureBias: e.target.value as any
            })} className="lcars-input">
              <option value="auto">Auto</option>
              <option value="warp">Warp</option>
              <option value="eps">EPS</option>
              <option value="sif">SIF</option>
              <option value="deflector">Deflector</option>
              <option value="transporter">Transporter</option>
              <option value="inertial">Inertial</option>
            </select>
            <label className="lcars-label">Humor Level</label>
          <input type="range" min={0} max={10} value={humor} onChange={e=>setHumor(parseInt(e.target.value))} />
        </div>
      </div>

      <div className="col-span-3 flex gap-2">
        <button onClick={generate} className="lcars-cta flex-1">Produce Report</button>
        <button
          onClick={previewCrew}
          className={"lcars-btn " + (manifestPanelOpen ? "lcars-btn-highlighted" : "")}
          style={manifestPanelOpen ? { background: '#FFB300', color: '#222', fontWeight: 'bold' } : {}}
        >
          {manifestPanelOpen ? "Hide Crew Manifest" : "Preview Crew Manifest"}
        </button>
      </div>

      {/* Add info note for report regeneration */}
      <div style={{ margin: '16px 0', color: '#FFB300', background: '#222', borderRadius: 12, padding: 12, fontSize: 16 }}>
        <div>
          <strong>Tip:</strong> You can regenerate the report by generating a new random seed.
        </div>
        {onRegenerate && (
          <button
            style={{ marginTop: 12, padding: '8px 18px', background: '#FFB300', color: '#222', border: 'none', borderRadius: 8, fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}
            onClick={onRegenerate}
          >
            Regenerate Report
          </button>
        )}
      </div>
    </div>
  );
}
