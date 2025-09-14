import React, { useMemo, useState } from "react";
import { dateToStardate, stardateToDate, formatStardate } from "../utils/stardate";

export default function StardateCalculator() {
  const [dateInput, setDateInput] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [sdInput, setSdInput] = useState<string>("41000.0");

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

  return (
    <div className="lcars-card mt-4">
      <div className="lcars-rail"></div>
      <div className="lcars-body space-y-3">
        <div className="text-lg font-semibold">Stardate Calculator</div>
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
