import React, { useMemo } from "react";
import LCARSChart from "./LCARSChart";
import { Figure } from "../types";
import { LCARS } from "../utils/lcars";



export default function FigureView({ fig }: { fig: Figure }){
  const accent = LCARS.accents[(fig.index ?? 0) % LCARS.accents.length];

  return (
    <div className="figure-container rounded-2xl p-4 border border-slate-700 bg-[#101425]">
      <div className="text-sm text-slate-300 mb-2 font-semibold">{fig.displayId || fig.id}. {fig.title}</div>
      <div className="h-48">
        <LCARSChart figure={fig} />
      </div>
      <div className="text-xs text-slate-400 mt-2 italic">{fig.caption} {fig.sectionAnchor ? `(Ref: ${fig.sectionAnchor})` : ""}</div>
    </div>
  );
}
