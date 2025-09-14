import React, { useEffect, useMemo, useRef, useState } from "react";
import { dateToStardate, stardateToDate, formatStardate } from "../utils/stardate";
import katex from "katex";
import "katex/dist/katex.min.css";

export default function StardateCalculator({ onStardateChange, currentStardate }: {
  onStardateChange?: (sd: string) => void,
  currentStardate?: string
}) {
  const [dateInput, setDateInput] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [sdInput, setSdInput] = useState<string>(currentStardate ?? "41000.0");
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const tngRef = useRef<HTMLDivElement | null>(null);
  const preRef = useRef<HTMLDivElement | null>(null);
  const inv1Ref = useRef<HTMLDivElement | null>(null);
  const inv2Ref = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);

  const dateToSd = useMemo(() => {
    const d = new Date(dateInput + "T00:00:00Z");
    if (isNaN(d.getTime())) return "";
    return formatStardate(dateToStardate(d));
  }, [dateInput]);

  const sdToDateStr = useMemo(() => {
    const n = Number(sdInput);
    if (!isFinite(n)) return "";
    const d = stardateToDate(n);
    return d.toISOString().slice(0, 10);
  }, [sdInput]);

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
      const sd = formatStardate(dateToStardate(d));
      onStardateChange?.(sd);
      setSdInput(sd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateInput]);

  // Render KaTeX when info is shown
  useEffect(() => {
    if (!showInfo) return;
    try {
      if (tngRef.current) {
        katex.render(String.raw`\text{Stardate} \approx 41000 + (\text{Year} - 2364)\cdot 1000 + \frac{\text{DayOfYear}}{365}\cdot 1000`, tngRef.current, { throwOnError: false });
      }
      if (preRef.current) {
        katex.render(String.raw`\text{Stardate} \approx (\text{Year} - 2323)\cdot 1000 + \frac{\text{DayOfYear}}{365}\cdot 1000`, preRef.current, { throwOnError: false });
      }
      if (inv1Ref.current) {
        katex.render(String.raw`\text{If } sd\ge 41000:\quad \text{Year} \approx 2364 + \left\lfloor\frac{sd - 41000}{1000}\right\rfloor,\; \text{DayOfYear} \approx \operatorname{round}(f\cdot 365)`, inv1Ref.current, { throwOnError: false });
      }
      if (inv2Ref.current) {
        katex.render(String.raw`\text{Else:}\quad \text{Year} \approx 2323 + \left\lfloor\frac{sd}{1000}\right\rfloor,\; \text{DayOfYear} \approx \operatorname{round}(f\cdot 365)`, inv2Ref.current, { throwOnError: false });
      }
    } catch {}
  }, [showInfo]);

  return (
    <div className="lcars-card mt-4">
      <div className="lcars-rail"></div>
      <div className="lcars-body space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Stardate Calculator</div>
          <button
            type="button"
            className="lcars-btn p-2 text-amber-300"
            title="Show formulas used for stardates"
            aria-label="Show stardate formula information"
            onClick={() => setShowInfo(v => !v)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.75 15h-1.5v-6h1.5v6zM12 9.25a.875.875 0 110-1.75.875.875 0 010 1.75z" />
            </svg>
          </button>
        </div>
        {showInfo && (
          <div className="text-sm text-slate-300 bg-slate-800/60 border border-slate-600 rounded-lg p-3 space-y-3 relative">
            <button
              type="button"
              className="absolute top-2 right-2 text-amber-300 hover:text-amber-200"
              aria-label="Close formula information"
              title="Close"
              onClick={() => setShowInfo(false)}
            >
              ×
            </button>
            <div className="font-semibold text-amber-300">Formulas Used (Approximate)</div>
            <p>
              These are fan-derived approximations for fun and consistency. Canon varies. Two regimes are used.
            </p>
            <div>
              <button
                type="button"
                className="lcars-btn text-amber-300"
                title="Copy formulas to clipboard"
                onClick={async () => {
                  const text = [
                    'TNG-era: Stardate ≈ 41000 + (Year − 2364) × 1000 + (DayOfYear / 365) × 1000',
                    'Pre‑TNG: Stardate ≈ (Year − 2323) × 1000 + (DayOfYear / 365) × 1000',
                    'Inverse (sd ≥ 41000): Year ≈ 2364 + floor((sd − 41000)/1000), DayOfYear ≈ round(f × 365)',
                    'Inverse (sd < 41000): Year ≈ 2323 + floor(sd/1000), DayOfYear ≈ round(f × 365)',
                    'where f is the fractional part within the 1000 range.'
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
              <div className="text-amber-200 font-medium">TNG-era (from 2364):</div>
              <div ref={tngRef} className="mt-1 overflow-x-auto select-text" style={{paddingTop: '6px', paddingBottom: '10px'}} />
            </div>
            <div>
              <div className="text-amber-200 font-medium">Pre‑TNG (before 2364):</div>
              <div ref={preRef} className="mt-1 overflow-x-auto select-text" style={{paddingTop: '6px', paddingBottom: '10px'}} />
            </div>
            <div>
              <div className="text-amber-200 font-medium">Inverse (Stardate → Date):</div>
              <div ref={inv1Ref} className="mt-1 overflow-x-auto select-text" style={{paddingTop: '6px', paddingBottom: '10px'}} />
              <div ref={inv2Ref} className="mt-1 overflow-x-auto select-text" style={{paddingTop: '6px', paddingBottom: '10px'}} />
              <div className="mt-1 text-slate-400">where f is the fractional part within the 1000 range.</div>
            </div>
            <p className="text-slate-400">
              Outputs are rounded to one decimal place for stardates and to the nearest day for the inverse.
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
          Approximation note: Uses common fan-calculated formulas (pre-TNG and TNG-era). Results are approximate and for fun.
        </div>
      </div>
    </div>
  );
}
