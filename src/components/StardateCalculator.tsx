import React, { useEffect, useMemo, useRef, useState } from "react";
import { dateToStardate, stardateToDate, formatStardate } from "../utils/stardate";
import { StardateMode } from "../types";
import katex from "katex";
import "katex/dist/katex.min.css";

export default function StardateCalculator({ onStardateChange, currentStardate, stardateMode = 'simple', onStardateModeChange }: {
  onStardateChange?: (sd: string) => void,
  currentStardate?: string,
  stardateMode?: StardateMode,
  onStardateModeChange?: (mode: StardateMode) => void
}) {
  const [dateInput, setDateInput] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [sdInput, setSdInput] = useState<string>(currentStardate ?? "41000.0");
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const simpleRef = useRef<HTMLDivElement | null>(null);
  const canonRef = useRef<HTMLDivElement | null>(null);
  const inv1Ref = useRef<HTMLDivElement | null>(null);
  const inv2Ref = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);

  const dateToSd = useMemo(() => {
    const d = new Date(dateInput + "T00:00:00Z");
    if (isNaN(d.getTime())) return "";
    return formatStardate(dateToStardate(d, stardateMode));
  }, [dateInput, stardateMode]);

  const sdToDateStr = useMemo(() => {
    const n = Number(sdInput);
    if (!isFinite(n)) return "";
    const d = stardateToDate(n, stardateMode);
    return d.toISOString().slice(0, 10);
  }, [sdInput, stardateMode]);

  // Emit stardate updates to parent (numeric string with one decimal)
  useEffect(() => {
    const n = Number(sdInput);
    if (isFinite(n)) {
      onStardateChange?.(formatStardate(n));
    } else {
      onStardateChange?.("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdInput]);

  // Keep local input in sync if parent updates currentStardate
  useEffect(() => {
    if (currentStardate && currentStardate !== sdInput) {
      setSdInput(currentStardate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStardate]);

  // When date changes, update the emitted stardate as well
  useEffect(() => {
    const d = new Date(dateInput + "T00:00:00Z");
    if (!isNaN(d.getTime())) {
      const sd = formatStardate(dateToStardate(d, stardateMode));
      onStardateChange?.(sd);
      setSdInput(sd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateInput, stardateMode]);

  // Render KaTeX when info is shown
  useEffect(() => {
    if (!showInfo) return;
    try {
      if (simpleRef.current) {
        katex.render(String.raw`\text{Stardate} \approx 41000 + (\text{Year} - 2364)\cdot 1000 + \frac{\text{DayOfYear}}{365}\cdot 1000`, simpleRef.current, { throwOnError: false });
      }
      if (canonRef.current) {
        katex.render(String.raw`\text{Stardate} = \frac{\text{Days since July 5, 2318 noon}}{365.2422}\cdot 918.23186`, canonRef.current, { throwOnError: false });
      }
      if (inv1Ref.current) {
        katex.render(String.raw`\text{Simple (sd}\ge 41000\text{):}\; \text{Year} \approx 2364 + \left\lfloor\frac{sd - 41000}{1000}\right\rfloor`, inv1Ref.current, { throwOnError: false });
      }
      if (inv2Ref.current) {
        katex.render(String.raw`\text{Canon:}\; \text{Date} = \text{July 5, 2318 noon} + \frac{sd}{918.23186}\cdot 365.2422\text{ days}`, inv2Ref.current, { throwOnError: false });
      }
    } catch {}
  }, [showInfo]);

  return (
    <div className="mt-2 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Stardate Calculator</div>
          <div className="flex items-center gap-2">
            {onStardateModeChange && (
              <div className="flex items-center gap-2 text-sm">
                <label className="text-slate-300">Mode:</label>
                <select
                  className="px-2 py-1 rounded bg-slate-700 text-white border border-slate-600 hover:bg-slate-600"
                  value={stardateMode}
                  onChange={(e) => onStardateModeChange(e.target.value as StardateMode)}
                >
                  <option value="simple">Simple (1000/year)</option>
                  <option value="canon">Canon (918.23/year)</option>
                </select>
              </div>
            )}
            <button
              type="button"
              className="px-2 py-1 rounded bg-blue-600 text-white border border-blue-500 hover:bg-blue-500"
              title="Show formulas used for stardates"
              aria-label="Show stardate formula information"
              onClick={() => setShowInfo(v => !v)}
            >
              i
            </button>
          </div>
        </div>
        {showInfo && (
          <div className="text-sm text-slate-300 bg-slate-800/60 border border-slate-600 rounded-lg p-3 pt-3 space-y-3 relative overflow-hidden">
            <button
              type="button"
              className="absolute top-2 right-2 text-slate-300 hover:text-white transition-colors"
              aria-label="Close formula information"
              title="Close"
              onClick={() => setShowInfo(false)}
            >
              ×
            </button>
            <div className="font-semibold text-blue-300">Stardate Calculation Modes</div>
            <p>
              This app offers two stardate calculation methods. <strong>Simple mode</strong> uses a clean 1000 stardates per year for ease of calculation. <strong>Canon mode</strong> uses the widely-accepted fan-derived formula (~918.23 stardates/year) based on detailed analysis of specific episodes from TNG, DS9, and Voyager.
            </p>
            <div>
              <button
                type="button"
                className="px-2 py-1 rounded bg-blue-600 text-white border border-blue-500 hover:bg-blue-500"
                title="Copy formulas to clipboard"
                onClick={async () => {
                  const text = [
                    'SIMPLE MODE (1000 stardates/year):',
                    'TNG-era: Stardate ≈ 41000 + (Year − 2364) × 1000 + (DayOfYear / 365) × 1000',
                    'Inverse: Year ≈ 2364 + floor((sd − 41000)/1000)',
                    '',
                    'CANON MODE (918.23186 stardates/year):',
                    'Stardate = (Days since July 5, 2318 noon / 365.2422) × 918.23186',
                    'Based on TrekGuide.com analysis of "Data\'s Day" (SD 44390.1) and "Homestead" (SD 54868.6)',
                    '',
                    'Both modes round to one decimal place for stardates.'
                  ].join('\n');
                  try {
                    await navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  } catch {}
                }}
              >
                {copied ? 'Copied!' : 'Copy formulas'}
              </button>
            </div>
            <div>
              <div className="text-blue-200 font-medium">Simple Mode (1000 stardates/year):</div>
              <div ref={simpleRef} className="mt-1 overflow-x-auto select-text" style={{paddingTop: '6px', paddingBottom: '10px'}} />
              <p className="text-slate-400 text-xs mt-1">
                Clean approximation: exactly 1000 stardates per year. Easy mental math.
              </p>
            </div>
            <div>
              <div className="text-blue-200 font-medium">Canon Mode (918.23186 stardates/year):</div>
              <div ref={canonRef} className="mt-1 overflow-x-auto select-text" style={{paddingTop: '6px', paddingBottom: '10px'}} />
              <p className="text-slate-400 text-xs mt-1">
                Based on <a href="https://trekguide.com/Stardates.htm" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">TrekGuide.com analysis</a> of episodes with known dates. Stardate 0000.0 = July 5, 2318 at noon. Most widely accepted by Trek fans.
              </p>
            </div>
            <div>
              <div className="text-blue-200 font-medium">Inverse Formulas (Stardate → Date):</div>
              <div ref={inv1Ref} className="mt-1 overflow-x-auto select-text" style={{paddingTop: '6px', paddingBottom: '10px'}} />
              <div ref={inv2Ref} className="mt-1 overflow-x-auto select-text" style={{paddingTop: '6px', paddingBottom: '10px'}} />
            </div>
            <p className="text-slate-400 text-xs">
              <strong>Note:</strong> Canon stardates vary wildly within episodes due to production inconsistencies. Both formulas are fan-derived approximations for long-term date tracking, not precise calculations within individual episodes.
            </p>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="lcars-label">Calendar Date → Stardate</label>
            <input
              type="date"
              className="lcars-input w-full"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
            />
            <div className="lcars-small mt-2">Stardate: {dateToSd || "–"}</div>
          </div>
          <div>
            <label className="lcars-label">Stardate → Calendar Date</label>
            <input
              type="text"
              inputMode="decimal"
              className="lcars-input w-full"
              value={sdInput}
              onChange={(e) => setSdInput(e.target.value)}
              placeholder="e.g., 46379.1"
            />
            <div className="lcars-small mt-2">Date (UTC): {sdToDateStr || "–"}</div>
          </div>
        </div>
        <div className="lcars-small text-slate-300">
          <strong>Currently using: {stardateMode === 'simple' ? 'Simple mode (1000 stardates/year)' : 'Canon mode (918.23 stardates/year)'}</strong>
          <br />
          {stardateMode === 'simple' && 'Clean approximation for easy calculation. Within ~9% of canon formula.'}
          {stardateMode === 'canon' && 'Most widely-accepted fan calculation based on TrekGuide.com episode analysis.'}
        </div>
    </div>
  );
}
