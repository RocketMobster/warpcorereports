import React, { useEffect, useMemo, useState } from "react";
import StardateCalculator from "./StardateCalculator";
import { GeneratorConfig, Rank, STARFLEET_VESSELS, FigureBias, MissionTemplate, FamousAuthorFrequency } from "../types";
import { pick, hashCode, xorshift32, POOLS, pickCrewName } from "../utils/helpers";

const ranks: Rank[] = [
  "Chief Petty Officer","Senior Chief Petty Officer","Master Chief Petty Officer",
  "Ensign","Lieutenant Junior Grade","Lieutenant","Lieutenant Commander","Commander"
];

// Lightweight accordion for mobile variant with customizable LCARS colors
function AccordionSection({ title, children, defaultOpen=false, railClass="bg-amber-500", titleClass="text-amber-300" }: { title: string; children: React.ReactNode; defaultOpen?: boolean; railClass?: string; titleClass?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="relative border border-slate-700 rounded-xl overflow-hidden bg-slate-900 shadow-md">
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${railClass}`} aria-hidden="true"></div>
      <button type="button" onClick={()=>setOpen(o=>!o)} className="w-full pl-4 pr-3 py-2 flex items-center justify-between text-left bg-slate-800/90 hover:bg-slate-700 transition-colors" aria-expanded={open}>
        <span className={`font-semibold tracking-wide text-xs uppercase ${titleClass}`}>{title}</span>
        <span className="text-[10px] text-slate-300">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="p-3 pl-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ReportControls({ onGenerate, onPreviewCrew, onRegenerate, manifestPanelOpen, onOpenHelp, persistZoom, onTogglePersistZoom, variant = 'desktop', stardateOverride, onStardateChange, useStardateOverride, onUseStardateToggle }: {
  onGenerate: (cfg: GeneratorConfig) => void,
  onPreviewCrew: (count?:number, seed?:string)=>void,
  onRegenerate?: () => void,
  manifestPanelOpen?: boolean,
  onOpenHelp?: (section?: "templates" | "figure-bias" | "presets" | "produce-reroll" | "references") => void,
  persistZoom?: boolean,
  onTogglePersistZoom?: (v:boolean)=>void,
  variant?: 'desktop' | 'mobile',
  stardateOverride?: string,
  onStardateChange?: (sd: string) => void,
  useStardateOverride?: boolean,
  onUseStardateToggle?: (v: boolean) => void
}) {
  const DEFAULTS = useMemo(() => ({
    problemsCount: 3 as 1|2|3|4|5,
    problemDetailLevel: 2,
    graphsEnabled: true,
    graphsCount: 3,
    signatoryName: "Craig Bickford",
    signatoryRank: "Lieutenant Commander" as Rank,
    vessel: STARFLEET_VESSELS[0].name,
    seed: "",
    humor: 5,
    signatoryReference: false,
    figureBias: "auto" as FigureBias,
  }), []);

  const [problemsCount, setProblemsCount] = useState<1|2|3|4|5>(DEFAULTS.problemsCount);
  const [problemDetailLevel, setProblemDetailLevel] = useState<number>(DEFAULTS.problemDetailLevel);
  const [graphsEnabled, setGraphsEnabled] = useState(DEFAULTS.graphsEnabled);
  const [graphsCount, setGraphsCount] = useState(DEFAULTS.graphsCount);
  const [signatoryName, setSignatoryName] = useState(DEFAULTS.signatoryName);
  const [signatoryRank, setSignatoryRank] = useState<Rank>(DEFAULTS.signatoryRank);
  const [vessel, setVessel] = useState<string>(DEFAULTS.vessel);
  const [seed, setSeed] = useState<string>(DEFAULTS.seed);
  const [seedLocked, setSeedLocked] = useState<boolean>(false);
  const [lastRandomSeed, setLastRandomSeed] = useState<string>("");
  const [humor, setHumor] = useState<number>(DEFAULTS.humor);
  const [signatoryReference, setSignatoryReference] = useState<boolean>(DEFAULTS.signatoryReference);
  const [figureBias, setFigureBias] = useState<FigureBias>(DEFAULTS.figureBias);
  const [missionTemplate, setMissionTemplate] = useState<MissionTemplate>("none");
  const [allowCanonNames, setAllowCanonNames] = useState<boolean>(true);
  const [filterCanonByEra, setFilterCanonByEra] = useState<boolean>(true);
  const [famousAuthorFrequency, setFamousAuthorFrequency] = useState<FamousAuthorFrequency>("occasional");
  const [famousRecentMemory, setFamousRecentMemory] = useState<number>(6);
  const [preset, setPreset] = useState<string>("custom");
  const [wasReset, setWasReset] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>("");

  // Helper: compare current state to a given preset
  const getPresetValues = (name: string) => {
    if (name === "diagnostic") return { pc: 2, pd: 2, ge: true, gc: 2, fb: "eps", hu: 2 } as const;
    if (name === "incident") return { pc: 4, pd: 4, ge: true, gc: 5, fb: "deflector", hu: 1 } as const;
    if (name === "maintenance") return { pc: 3, pd: 3, ge: true, gc: 3, fb: "sif", hu: 4 } as const;
    if (name === "performance") return { pc: 3, pd: 2, ge: true, gc: 6, fb: "warp", hu: 3 } as const;
    return null;
  };
  const isPresetMatch = (name: string) => {
    const p = getPresetValues(name);
    if (!p) return false;
    return (
      problemsCount === p.pc && problemDetailLevel === p.pd && graphsEnabled === p.ge &&
      graphsCount === p.gc && figureBias === p.fb && humor === p.hu
    );
  };
  const presetStatus = useMemo(() => {
    if (preset === "custom") return "Custom";
    return isPresetMatch(preset) ? "Active" : "Modified";
  }, [preset, problemsCount, problemDetailLevel, graphsEnabled, graphsCount, figureBias, humor]);

  const handleRandomName = () => {
  const rnd = xorshift32(Math.floor(Math.random() * 1e9));
  setSignatoryName(pickCrewName(rnd));
  };

  // Randomizers for specific controls
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const handleRandomProblemsCount = () => setProblemsCount(randomInt(1, 5) as 1|2|3|4|5);
  const handleRandomProblemDetail = () => setProblemDetailLevel(randomInt(1, 6));
  const handleRandomGraphsToggleAndCount = () => {
    const enabled = Math.random() < 0.8;
    setGraphsEnabled(enabled);
    if (enabled) setGraphsCount(randomInt(1, 10));
  };
  const handleRandomGraphsCount = () => setGraphsCount(randomInt(1, 10));
  const handleRandomVessel = () => setVessel(STARFLEET_VESSELS[Math.floor(Math.random() * STARFLEET_VESSELS.length)].name);
  const handleRandomRank = () => setSignatoryRank(ranks[Math.floor(Math.random() * ranks.length)]);
  const handleRandomHumor = () => setHumor(randomInt(0, 10));

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

  // Randomize all configurable inputs at once (respects seed lock)
  const handleRandomizeAll = () => {
    handleRandomProblemsCount();
    handleRandomProblemDetail();
    handleRandomGraphsToggleAndCount();
    handleRandomVessel();
    handleRandomName();
    handleRandomRank();
    handleRandomHumor();
    // 40% chance to include signatory as reference
    setSignatoryReference(Math.random() < 0.4);
    if (!seedLocked) {
      handleRandomSeed();
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setProblemsCount(DEFAULTS.problemsCount);
    setProblemDetailLevel(DEFAULTS.problemDetailLevel);
    setGraphsEnabled(DEFAULTS.graphsEnabled);
    setGraphsCount(DEFAULTS.graphsCount);
    setSignatoryName(DEFAULTS.signatoryName);
    setSignatoryRank(DEFAULTS.signatoryRank);
    setVessel(DEFAULTS.vessel);
    setSeed(DEFAULTS.seed);
    setSeedLocked(false);
    setLastRandomSeed("");
    setHumor(DEFAULTS.humor);
    setSignatoryReference(DEFAULTS.signatoryReference);
    setFigureBias(DEFAULTS.figureBias);
    setPreset("custom");
    setWasReset(true);
    try { localStorage.setItem('wcr_was_reset', 'true'); } catch {}
  };

  // Presets
  const applyPreset = (name: string) => {
    setPreset(name);
    try { localStorage.setItem('wcr_preset', name); } catch {}
    if (name === "diagnostic") {
      setProblemsCount(2 as any); setProblemDetailLevel(2); setGraphsEnabled(true); setGraphsCount(2); setFigureBias("eps"); setHumor(2);
    } else if (name === "incident") {
      setProblemsCount(4 as any); setProblemDetailLevel(4); setGraphsEnabled(true); setGraphsCount(5); setFigureBias("deflector"); setHumor(1);
    } else if (name === "maintenance") {
      setProblemsCount(3 as any); setProblemDetailLevel(3); setGraphsEnabled(true); setGraphsCount(3); setFigureBias("sif"); setHumor(4);
    } else if (name === "performance") {
      setProblemsCount(3 as any); setProblemDetailLevel(2); setGraphsEnabled(true); setGraphsCount(6); setFigureBias("warp"); setHumor(3);
    } else {
      setPreset("custom");
    }
  };

  // Shareable config link (encodes only UI settings)
  const copySettingsLink = async () => {
    const cfg = {
      pc: problemsCount,
      pd: problemDetailLevel,
      ge: graphsEnabled ? 1 : 0,
      gc: graphsEnabled ? graphsCount : 0,
      sn: signatoryName,
      sr: signatoryRank,
      vs: vessel,
      sd: seed,
      hu: humor,
      rf: signatoryReference ? 1 : 0,
      fb: figureBias,
  mt: missionTemplate,
  cn: allowCanonNames ? 1 : 0,
  ce: filterCanonByEra ? 1 : 0,
  ff: famousAuthorFrequency,
  fm: Math.max(0, Math.min(20, Math.floor(famousRecentMemory))),
    };
    const packed = btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));
    const url = new URL(window.location.href);
    url.searchParams.set("cfg", packed);
    // Remove shared-report hash if present; this link is just settings
    url.hash = "";
    try {
      await navigator.clipboard.writeText(url.toString());
      setToastMsg('Settings link copied to clipboard.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1800);
    } catch (e) {
      console.error("Clipboard failed:", e);
      setToastMsg('Unable to copy. Copy from the address bar.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  // Load settings from ?cfg= on first mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const packed = params.get("cfg");
      if (!packed) return;
      const json = decodeURIComponent(escape(atob(packed)));
      const cfg = JSON.parse(json);
      if (cfg.pc) setProblemsCount(Math.max(1, Math.min(5, cfg.pc)) as any);
      if (cfg.pd != null) setProblemDetailLevel(Math.max(1, Math.min(6, cfg.pd)));
      if (cfg.ge != null) setGraphsEnabled(!!cfg.ge);
      if (cfg.gc != null) setGraphsCount(Math.max(1, Math.min(10, cfg.gc)));
      if (cfg.sn) setSignatoryName(String(cfg.sn).slice(0, 80));
      if (cfg.sr) setSignatoryRank(cfg.sr as Rank);
      if (cfg.vs) setVessel(String(cfg.vs));
      if (cfg.sd != null) setSeed(String(cfg.sd));
      if (cfg.hu != null) setHumor(Math.max(0, Math.min(10, cfg.hu)));
      if (cfg.rf != null) setSignatoryReference(!!cfg.rf);
      if (cfg.fb) setFigureBias(cfg.fb as FigureBias);
  if (cfg.mt) setMissionTemplate(cfg.mt as MissionTemplate);
  if (cfg.cn != null) setAllowCanonNames(!!cfg.cn);
  if (cfg.ce != null) setFilterCanonByEra(!!cfg.ce);
  if (cfg.ff) setFamousAuthorFrequency(cfg.ff as FamousAuthorFrequency);
  if (cfg.fm != null) setFamousRecentMemory(Math.max(0, Math.min(20, Math.floor(cfg.fm))));
      setPreset("custom");
      try { localStorage.setItem('wcr_preset', 'custom'); } catch {}
    } catch (e) {
      console.warn("Failed to parse cfg from URL", e);
    }
  }, []);

  // If no cfg is provided, load persisted preset/reset state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasCfg = !!params.get('cfg');
    if (hasCfg) return;
    try {
      const p = localStorage.getItem('wcr_preset');
      const wr = localStorage.getItem('wcr_was_reset');
      if (p && p !== 'custom') {
        applyPreset(p);
      } else if (p === 'custom') {
        setPreset('custom');
      }
      setWasReset(wr === 'true');
    } catch {}
  }, []);

  // When any control changes and differs from defaults, clear wasReset
  useEffect(() => {
    const equalsDefaults = (
      problemsCount === DEFAULTS.problemsCount &&
      problemDetailLevel === DEFAULTS.problemDetailLevel &&
      graphsEnabled === DEFAULTS.graphsEnabled &&
      graphsCount === DEFAULTS.graphsCount &&
      signatoryName === DEFAULTS.signatoryName &&
      signatoryRank === DEFAULTS.signatoryRank &&
      vessel === DEFAULTS.vessel &&
      (seed || "") === (DEFAULTS.seed || "") &&
      humor === DEFAULTS.humor &&
      signatoryReference === DEFAULTS.signatoryReference &&
      figureBias === DEFAULTS.figureBias
    );
    if (!equalsDefaults && wasReset) {
      setWasReset(false);
      try { localStorage.setItem('wcr_was_reset', 'false'); } catch {}
    }
  }, [problemsCount, problemDetailLevel, graphsEnabled, graphsCount, signatoryName, signatoryRank, vessel, seed, humor, signatoryReference, figureBias]);

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
      figureBias,
      missionTemplate,
      allowCanonNames,
      filterCanonByEra,
      famousAuthorFrequency,
      famousRecentMemory,
      stardate: ""
    };
    onGenerate(cfg);
  };

  // Add preview crew manifest button
  const previewCrew = () => {
    // Use onPreviewCrew callback with no fixed count to let App.tsx handle the random sizing
    onPreviewCrew(undefined, seed);
  };

  // Mobile variant: stacked accordions and compact action bar
  if (variant === 'mobile') {
    return (
      <>
        <div className="space-y-3 mb-4">
          <AccordionSection title="Ship & Signature" defaultOpen railClass="bg-amber-500" titleClass="text-amber-300">
            <div className="space-y-2">
              <div>
                <label className="lcars-label">Starship</label>
                <div className="flex gap-2 items-center mt-1">
                  <select value={vessel} onChange={e=>setVessel(e.target.value)} className="lcars-input flex-1" aria-label="Select starship">
                    {STARFLEET_VESSELS.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                  </select>
                  <button onClick={handleRandomVessel} className="lcars-btn" title="Randomize starship" aria-label="Randomize starship">🎲</button>
                </div>
              </div>
              <div>
                <label className="lcars-label">Signing Engineer</label>
                <div className="flex gap-2 mt-1">
                  <input type="text" value={signatoryName} onChange={e=>setSignatoryName(e.target.value)} className="lcars-input flex-1" />
                  <button onClick={handleRandomName} className="lcars-btn" title="Randomize signing engineer" aria-label="Randomize signing engineer">🎲</button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="signatoryReference_m" checked={signatoryReference} onChange={e => setSignatoryReference(e.target.checked)} />
                <label htmlFor="signatoryReference_m" className="lcars-label">Add Name to References</label>
              </div>
              <div>
                <label className="lcars-label">Rank</label>
                <div className="flex gap-2 items-center mt-1">
                  <select value={signatoryRank} onChange={e=>setSignatoryRank(e.target.value as Rank)} className="lcars-input flex-1" aria-label="Select rank">
                    {ranks.map(r=> <option key={r}>{r}</option>)}
                  </select>
                  <button onClick={handleRandomRank} className="lcars-btn" title="Randomize rank" aria-label="Randomize rank">🎲</button>
                </div>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Problems & Graphs" defaultOpen railClass="bg-purple-500" titleClass="text-purple-300">
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <label className="lcars-label">Problems</label>
                  <button onClick={handleRandomProblemsCount} className="lcars-btn" title="Randomize number of problems" aria-label="Randomize number of problems">🎲</button>
                </div>
                <input type="range" min={1} max={5} value={problemsCount} onChange={(e)=>setProblemsCount(parseInt(e.target.value) as any)} />
                <div className="lcars-small flex items-center gap-2">
                  <span>{problemsCount}</span>
                  <span>Problems per report</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="lcars-label">Problem Detail Level</label>
                  <button onClick={handleRandomProblemDetail} className="lcars-btn" title="Randomize problem detail level" aria-label="Randomize problem detail level">🎲</button>
                </div>
                <input type="range" min={1} max={6} value={problemDetailLevel} onChange={e=>setProblemDetailLevel(parseInt(e.target.value))} />
                <div className="lcars-small">{problemDetailLevel} sentence{problemDetailLevel > 1 ? 's' : ''} per problem</div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="lcars-label">Graphs</label>
                  <button onClick={handleRandomGraphsToggleAndCount} className="lcars-btn" title="Randomize graphs on/off and count" aria-label="Randomize graphs on/off and count">🎲</button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <input type="checkbox" checked={graphsEnabled} onChange={e=>setGraphsEnabled(e.target.checked)} />
                  <span className="lcars-small">Enable</span>
                </div>
                {graphsEnabled && (
                  <div className="mt-1">
                    <div className="flex items-center justify-between">
                      <label className="lcars-label">How many (1–10)</label>
                      <button onClick={handleRandomGraphsCount} className="lcars-btn" title="Randomize graph count" aria-label="Randomize graph count">🎲</button>
                    </div>
                    <input type="range" min={1} max={10} value={graphsCount} onChange={(e)=>setGraphsCount(parseInt(e.target.value))} />
                    <div className="lcars-small">{graphsCount}</div>
                  </div>
                )}
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="References & Canon Names" railClass="bg-cyan-500" titleClass="text-cyan-300">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="allowCanonNames_m" checked={allowCanonNames} onChange={e => setAllowCanonNames(e.target.checked)} />
                <label htmlFor="allowCanonNames_m" className="lcars-label">Allow Canon Names in References</label>
                {onOpenHelp && (
                  <button type="button" className="lcars-btn" onClick={() => onOpenHelp('references')} title="Open Help about References & Canon Names" aria-label="Open Help about References & Canon Names">ℹ️</button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="filterCanonByEra_m" checked={filterCanonByEra} onChange={e => setFilterCanonByEra(e.target.checked)} disabled={!allowCanonNames} />
                <label htmlFor="filterCanonByEra_m" className="lcars-label">Filter Canon Names by Era</label>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="lcars-label">Famous Author Frequency</label>
                  <span className="lcars-small">(References)</span>
                </div>
                <select value={famousAuthorFrequency} onChange={e=>setFamousAuthorFrequency(e.target.value as FamousAuthorFrequency)} className="lcars-input" disabled={!allowCanonNames}>
                  <option value="off">Off</option>
                  <option value="rare">Rare</option>
                  <option value="occasional">Occasional</option>
                  <option value="frequent">Frequent</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="lcars-label">Famous Rotation Memory</label>
                  <span className="lcars-small">(0–20, default 6)</span>
                </div>
                <input type="range" min={0} max={20} value={famousRecentMemory} onChange={e=>setFamousRecentMemory(parseInt(e.target.value))} disabled={!allowCanonNames} />
                <div className="lcars-small">{famousRecentMemory}</div>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Generation Options" defaultOpen railClass="bg-pink-500" titleClass="text-pink-300">
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <label className="lcars-label">Figure Bias</label>
                  {onOpenHelp && (
                    <button type="button" className="lcars-btn" onClick={() => onOpenHelp('figure-bias')} title="Open Help about figure bias" aria-label="Open Help about figure bias">ℹ️</button>
                  )}
                </div>
                <select value={figureBias} onChange={e=>setFigureBias(e.target.value as FigureBias)} className="lcars-input mt-1">
                  <option value="auto">Auto</option>
                  <option value="warp">Warp</option>
                  <option value="eps">EPS</option>
                  <option value="sif">SIF</option>
                  <option value="deflector">Deflector</option>
                  <option value="transporter">Transporter</option>
                  <option value="inertial">Inertial</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="lcars-label">Mission Template</label>
                  {onOpenHelp && (
                    <button type="button" className="lcars-btn" onClick={() => onOpenHelp('templates')} title="Open Help about templates" aria-label="Open Help about templates">ℹ️</button>
                  )}
                </div>
                <select value={missionTemplate} onChange={e=>setMissionTemplate(e.target.value as MissionTemplate)} className="lcars-input mt-1">
                  <option value="none">None</option>
                  <option value="incident">Incident</option>
                  <option value="survey">Survey</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="lcars-label">Humor Level</label>
                  <button onClick={handleRandomHumor} className="lcars-btn" title="Randomize humor level" aria-label="Randomize humor level">🎲</button>
                </div>
                <input type="range" min={0} max={10} value={humor} onChange={e=>setHumor(parseInt(e.target.value))} />
                <div className="lcars-small flex items-center gap-2">
                  <span>{humor}</span>
                  <span>Humor Level</span>
                </div>
              </div>
              <div>
                <label className="lcars-label">Seed</label>
                <div className="flex gap-2 mt-1">
                  <input type="text" value={seed} onChange={e=>setSeed(e.target.value)} className="lcars-input flex-1" placeholder="optional" aria-label="Seed (optional)" />
                  <button onClick={handleRandomSeed} className="lcars-btn" title="Generate random seed" aria-label="Generate random seed">🎲</button>
                  <button onClick={toggleSeedLock} className={"lcars-btn "+(seedLocked?"lcars-btn-locked":"")} title="Lock or unlock seed" aria-label="Lock or unlock seed">{seedLocked ? '🔒' : '🔓'}</button>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="lcars-label">Preset</label>
                    {onOpenHelp && (
                      <button type="button" className="lcars-btn" onClick={() => onOpenHelp('presets')} title="Open Help about presets" aria-label="Open Help about presets">ℹ️</button>
                    )}
                  </div>
                  <select value={preset} onChange={(e)=>applyPreset(e.target.value)} className="lcars-input">
                    <option value="custom">Custom</option>
                    <option value="diagnostic">Diagnostic</option>
                    <option value="incident">Incident</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="performance">Performance</option>
                  </select>
                  <span className={`text-xs px-2 py-1 rounded-md border ${presetStatus === 'Active' ? 'bg-green-600 border-green-500' : presetStatus === 'Modified' ? 'bg-amber-600 border-amber-500' : 'bg-slate-700 border-slate-600'}`}>{presetStatus}</span>
                </div>
              </div>
              {/* Action buttons inside Generation Options (compact, single row when possible) */}
              <div className="mt-4 flex gap-2 flex-wrap md:flex-nowrap">
                <button onClick={resetToDefaults} className="px-2 py-1 rounded-md bg-blue-600 text-white border border-blue-500 hover:bg-blue-500 text-[11px] uppercase tracking-wide" title="Reset controls to defaults" aria-label="Reset controls to defaults">Reset</button>
                <button onClick={handleRandomizeAll} className="px-2 py-1 rounded-md bg-amber-500 text-black border border-amber-400 hover:bg-amber-400 text-[11px] uppercase tracking-wide" title="Randomize all controls" aria-label="Randomize all controls">Randomize All 🎲</button>
                <button onClick={copySettingsLink} className="px-2 py-1 rounded-md bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700 text-[11px] uppercase tracking-wide" title="Copy a shareable link for current settings" aria-label="Copy shareable settings link">Copy Settings Link</button>
                <button onClick={previewCrew} className={"px-2 py-1 rounded-md bg-pink-500 hover:bg-pink-400 text-black border border-pink-400 text-[11px] uppercase tracking-wide "+(manifestPanelOpen?" font-bold":"")}>
                  {manifestPanelOpen ? 'Hide Crew' : 'Preview Crew'}
                </button>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Stardate" railClass="bg-blue-600" titleClass="text-blue-300">
            <div className="space-y-3">
              {onStardateChange && onUseStardateToggle && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="useStardateOverride_m"
                      checked={!!useStardateOverride}
                      onChange={e => onUseStardateToggle(e.target.checked)}
                    />
                    <label htmlFor="useStardateOverride_m" className="lcars-label">Use Stardate in Report</label>
                    {useStardateOverride && (
                      <span className="lcars-small">Current: {stardateOverride || "—"}</span>
                    )}
                  </div>
                  <StardateCalculator onStardateChange={onStardateChange} currentStardate={stardateOverride || ""} />
                </div>
              )}
            </div>
          </AccordionSection>
        </div>

        {/* Hidden produce trigger for the floating action bar */}
        <button id="produce-button" onClick={generate} className="hidden" aria-hidden="true" tabIndex={-1} />

        {/* External button bar removed; actions moved into Generation Options */}

        {showToast && (
          <div className="fixed bottom-4 right-4 bg-slate-900 text-amber-300 px-4 py-2 rounded-lg border border-amber-500 shadow-lg z-50">{toastMsg}</div>
        )}
      </>
    );
  }

  // Desktop variant (default): original 3-column LCARS layout
  return (
    <>
    <div className="grid md:grid-cols-3 gap-4 mb-6">
  <div className="lcars-card">
        <div className="lcars-rail"></div>
  <div className="lcars-body">
          <div className="flex items-center justify-between">
            <label className="lcars-label">Problems</label>
            <button onClick={handleRandomProblemsCount} className="lcars-btn" title="Randomize number of problems" aria-label="Randomize number of problems">🎲</button>
          </div>
          <input type="range" min={1} max={5} value={problemsCount} onChange={(e)=>setProblemsCount(parseInt(e.target.value) as any)} />
          <div className="lcars-small flex items-center gap-2"><span>{problemsCount}</span><span>Problems per report</span></div>
          <div className="flex items-center justify-between mt-2">
            <label className="lcars-label">Problem Detail Level</label>
            <button onClick={handleRandomProblemDetail} className="lcars-btn" title="Randomize problem detail level" aria-label="Randomize problem detail level">🎲</button>
          </div>
          <input type="range" min={1} max={6} value={problemDetailLevel} onChange={e=>setProblemDetailLevel(parseInt(e.target.value))} />
          <div className="lcars-small">{problemDetailLevel} sentence{problemDetailLevel > 1 ? "s" : ""} per problem</div>
        </div>
      </div>

      <div className="lcars-card">
        <div className="lcars-rail lcars-rail-alt"></div>
        <div className="lcars-body">
          <div className="flex items-center justify-between">
            <label className="lcars-label">Graphs</label>
            <button onClick={handleRandomGraphsToggleAndCount} className="lcars-btn" title="Randomize graphs on/off and count" aria-label="Randomize graphs on/off and count">🎲</button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input type="checkbox" checked={graphsEnabled} onChange={e=>setGraphsEnabled(e.target.checked)} />
            <span className="lcars-small">Enable</span>
          </div>
          {graphsEnabled && <>
            <div className="flex items-center justify-between mt-2">
              <label className="lcars-label">How many (1–10)</label>
              <button onClick={handleRandomGraphsCount} className="lcars-btn" title="Randomize graph count" aria-label="Randomize graph count">🎲</button>
            </div>
            <input type="range" min={1} max={10} value={graphsCount} onChange={(e)=>setGraphsCount(parseInt(e.target.value))} />
            <div className="lcars-small">{graphsCount}</div>
          </>}
        </div>
      </div>

      <div className="lcars-card">
        <div className="lcars-rail lcars-rail-accent"></div>
        <div className="lcars-body space-y-2">
          <label className="lcars-label">Starship</label>
          <div className="flex gap-2 items-center">
            <select value={vessel} onChange={e=>setVessel(e.target.value)} className="lcars-input flex-1" aria-label="Select starship">
              {STARFLEET_VESSELS.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
            </select>
            <button onClick={handleRandomVessel} className="lcars-btn" title="Randomize starship" aria-label="Randomize starship">🎲</button>
          </div>
          <label className="lcars-label mt-2">Signing Engineer</label>
          <div className="flex gap-2">
            <input type="text" value={signatoryName} onChange={e=>setSignatoryName(e.target.value)} className="lcars-input flex-1" />
            <button onClick={handleRandomName} className="lcars-btn" title="Randomize signing engineer" aria-label="Randomize signing engineer">🎲</button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="signatoryReference"
              checked={signatoryReference}
              onChange={e => setSignatoryReference(e.target.checked)}
              title="Include the signing engineer in References"
              aria-label="Add name to References"
            />
            <label htmlFor="signatoryReference" className="lcars-label">
              Add Name to References
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allowCanonNames"
              checked={allowCanonNames}
              onChange={e => setAllowCanonNames(e.target.checked)}
              title="Allow occasional famous canon names in References"
              aria-label="Allow canon names in References"
            />
            <label htmlFor="allowCanonNames" className="lcars-label">
              Allow Canon Names in References
            </label>
            {onOpenHelp && (
              <button
                type="button"
                className="lcars-btn"
                onClick={() => onOpenHelp("references")}
                title="Open Help about References & Canon Names"
                aria-label="Open Help about References & Canon Names"
              >
                ℹ️
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="filterCanonByEra"
              checked={filterCanonByEra}
              onChange={e => setFilterCanonByEra(e.target.checked)}
              disabled={!allowCanonNames}
              title="Filter canon names by the vessel's active era"
              aria-label="Filter canon names by era"
            />
            <label htmlFor="filterCanonByEra" className="lcars-label">
              Filter Canon Names by Era
            </label>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="lcars-label">Famous Author Frequency</label>
              <span className="lcars-small">(References)</span>
            </div>
            <select
              value={famousAuthorFrequency}
              onChange={e=>setFamousAuthorFrequency(e.target.value as FamousAuthorFrequency)}
              className="lcars-input"
              disabled={!allowCanonNames}
              aria-label="Famous author frequency"
              title="How often famous canon names may appear in References"
            >
              <option value="off">Off</option>
              <option value="rare">Rare</option>
              <option value="occasional">Occasional</option>
              <option value="frequent">Frequent</option>
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="lcars-label">Famous Rotation Memory</label>
              <span className="lcars-small">(0–20, default 6)</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              value={famousRecentMemory}
              onChange={e=>setFamousRecentMemory(parseInt(e.target.value))}
              disabled={!allowCanonNames}
              aria-label="Famous rotation memory"
              title="How many recently-used famous authors are avoided"
            />
            <div className="lcars-small">{famousRecentMemory}</div>
          </div>
          <label className="lcars-label">Rank</label>
          <div className="flex gap-2 items-center">
            <select value={signatoryRank} onChange={e=>setSignatoryRank(e.target.value as Rank)} className="lcars-input flex-1" aria-label="Select rank">
              {ranks.map(r=> <option key={r}>{r}</option>)}
            </select>
            <button onClick={handleRandomRank} className="lcars-btn" title="Randomize rank" aria-label="Randomize rank">🎲</button>
          </div>

          <label className="lcars-label">Seed</label>
          <div className="flex gap-2">
            <input type="text" value={seed} onChange={e=>setSeed(e.target.value)} className="lcars-input flex-1" placeholder="optional" aria-label="Seed (optional)" />
            <button onClick={handleRandomSeed} className="lcars-btn" title="Generate random seed" aria-label="Generate random seed">🎲</button>
            <button onClick={toggleSeedLock} className={"lcars-btn " + (seedLocked ? "lcars-btn-locked" : "")} title="Lock or unlock seed" aria-label="Lock or unlock seed">{seedLocked ? "🔒" : "🔓"}</button>
          </div>

          <div className="flex items-center justify-between">
            <label className="lcars-label">Figure Bias</label>
            {onOpenHelp && (
              <button
                type="button"
                className="lcars-btn"
                onClick={() => onOpenHelp("figure-bias")}
                title="Open Help about figure bias"
                aria-label="Open Help about figure bias"
              >
                ℹ️
              </button>
            )}
          </div>
            <select value={figureBias} onChange={e=>setFigureBias(e.target.value as FigureBias)} className="lcars-input">
              <option value="auto">Auto</option>
              <option value="warp">Warp</option>
              <option value="eps">EPS</option>
              <option value="sif">SIF</option>
              <option value="deflector">Deflector</option>
              <option value="transporter">Transporter</option>
              <option value="inertial">Inertial</option>
            </select>
            <div className="flex items-center justify-between mt-2">
              <label className="lcars-label">Mission Template</label>
              {onOpenHelp && (
                <button
                  type="button"
                  className="lcars-btn"
                  onClick={() => onOpenHelp("templates")}
                  title="Open Help about templates and presets"
                  aria-label="Open Help about templates and presets"
                >
                  ℹ️
                </button>
              )}
            </div>
            <select value={missionTemplate} onChange={e=>setMissionTemplate(e.target.value as MissionTemplate)} className="lcars-input">
              <option value="none">None</option>
              <option value="incident">Incident</option>
              <option value="survey">Survey</option>
            </select>
            <div className="flex items-center justify-between mt-2">
              <label className="lcars-label">Humor Level</label>
              <button onClick={handleRandomHumor} className="lcars-btn" title="Randomize humor level" aria-label="Randomize humor level">🎲</button>
            </div>
          <input type="range" min={0} max={10} value={humor} onChange={e=>setHumor(parseInt(e.target.value))} />
          <div className="lcars-small flex items-center gap-2"><span>{humor}</span><span>Humor Level</span></div>
        </div>
      </div>

  <div className="col-span-3 flex flex-wrap gap-2">
        <button
          onClick={generate}
          className="lcars-cta flex-1"
          title="Produce a new report using the settings above"
          aria-label="Produce a new report using the settings above"
        >
          Produce Report
        </button>
        <button onClick={handleRandomizeAll} className="lcars-btn" title="Randomize all controls" aria-label="Randomize all controls">Randomize All 🎲</button>
        <button onClick={resetToDefaults} className="lcars-btn" title="Reset controls to defaults" aria-label="Reset controls to defaults">Reset</button>
        <div className="flex items-center gap-2">
          <label className="lcars-label">Preset</label>
          {onOpenHelp && (
            <button
              type="button"
              className="lcars-btn"
              onClick={() => onOpenHelp("presets")}
              title="Open Help about presets"
              aria-label="Open Help about presets"
            >
              ℹ️
            </button>
          )}
          <select value={preset} onChange={(e)=>applyPreset(e.target.value)} className="lcars-input">
            <option value="custom">Custom</option>
            <option value="diagnostic">Diagnostic</option>
            <option value="incident">Incident</option>
            <option value="maintenance">Maintenance</option>
            <option value="performance">Performance</option>
          </select>
          <span className={`text-xs px-2 py-1 rounded-md border ${presetStatus === 'Active' ? 'bg-green-600 border-green-500' : presetStatus === 'Modified' ? 'bg-amber-600 border-amber-500' : 'bg-slate-700 border-slate-600'}`}>
            {presetStatus}
          </span>
          {wasReset && (
            <span className="text-xs px-2 py-1 rounded-md border bg-blue-700 border-blue-500">Reset</span>
          )}
        </div>
        <button onClick={copySettingsLink} className="lcars-btn" title="Copy a shareable link for current settings" aria-label="Copy shareable settings link">Copy Settings Link</button>
        <button
          onClick={previewCrew}
          className={"lcars-btn " + (manifestPanelOpen ? "lcars-btn-highlighted" : "")}
          style={manifestPanelOpen ? { background: '#FFB300', color: '#222', fontWeight: 'bold' } : {}}
        >
          {manifestPanelOpen ? "Hide Crew Manifest" : "Preview Crew Manifest"}
        </button>
      </div>

      {/* Reroll current report (uses same settings as the displayed report) */}
      {onRegenerate && (
        <div style={{ margin: '16px 0', color: '#FFB300', background: '#222', borderRadius: 12, padding: 12, fontSize: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <strong>Tip:</strong> Reroll the current report’s randomized content using the same settings.
            </div>
            {onOpenHelp && (
              <button
                type="button"
                className="lcars-btn"
                onClick={() => onOpenHelp("produce-reroll")}
                title="Open Help about Produce vs Reroll"
                aria-label="Open Help about Produce vs Reroll"
                style={{ marginLeft: 8 }}
              >
                ℹ️
              </button>
            )}
          </div>
          <button
            style={{ marginTop: 12, padding: '8px 18px', background: '#FFB300', color: '#222', border: 'none', borderRadius: 8, fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}
            onClick={onRegenerate}
            title="Reroll content with the current report’s settings. Control changes above aren’t applied until you click Produce Report."
            aria-label="Reroll content with the current report’s settings. Control changes above aren’t applied until you click Produce Report."
          >
            Reroll Current Report
          </button>
        </div>
      )}
    </div>
    {showToast && (
      <div className="fixed bottom-4 right-4 bg-slate-900 text-amber-300 px-4 py-2 rounded-lg border border-amber-500 shadow-lg z-50">
        {toastMsg}
      </div>
    )}
    </>
  );
}
