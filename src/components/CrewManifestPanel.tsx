import React, { useState, useEffect, useRef } from "react";
import { generateCrewManifest } from "../utils/reportGen";
import { CrewMember } from "../types";

export default function CrewManifestPanel({ 
  count = 8, 
  onCrewChange, 
  onRegenerate,
  onClose
}: { 
  count?: number; 
  onCrewChange?: (crew: any[]) => void;
  onRegenerate?: () => void;
  onClose?: () => void;
}) {
  // Use a ref to track previous count
  const prevCountRef = useRef<number>(count);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  
  // Initialize crew on first render
  useEffect(() => {
    const newCrew = generateCrewManifest(count);
    setCrew(newCrew);
    if (onCrewChange) onCrewChange(newCrew);
    prevCountRef.current = count;
  }, []); // Empty dependency array - run only once on mount
  
  // Update crew when count changes
  useEffect(() => {
    // Only regenerate if count has changed
    if (count !== prevCountRef.current) {
      const newCrew = generateCrewManifest(count);
      setCrew(newCrew);
      if (onCrewChange) onCrewChange(newCrew);
      prevCountRef.current = count;
    }
  }, [count]); // Only depend on count

  return (
    <div className="mt-4 rounded-2xl border border-pink-400/40 bg-pink-500/10 p-4 shadow-md relative">
      {onClose && (
        <button
          type="button"
          className="absolute top-2 right-2 text-pink-300 hover:text-pink-200"
          aria-label="Close"
          title="Close"
          onClick={onClose}
        >
          ×
        </button>
      )}
      <h3 className="text-lg font-bold mb-2 text-pink-300">
        Crew Manifest Preview ({crew.length} crew members)
      </h3>
      <ul className="text-[15px] text-slate-100 space-y-1 mb-3">
        {crew.map((member, i) => (
          <li key={i}>{member.rank} {member.name} – {member.role}</li>
        ))}
      </ul>
      <button
        className="px-4 py-2 rounded-md bg-pink-500 hover:bg-pink-400 text-black border border-pink-400 font-bold text-sm"
        onClick={onRegenerate}
      >
        Regenerate Crew Manifest
      </button>
    </div>
  );
}
