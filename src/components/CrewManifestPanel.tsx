import React, { useState, useEffect, useRef } from "react";
import { generateCrewManifest } from "../utils/reportGen";
import { CrewMember } from "../types";

export default function CrewManifestPanel({ 
  count = 8, 
  onCrewChange, 
  onRegenerate 
}: { 
  count?: number; 
  onCrewChange?: (crew: any[]) => void;
  onRegenerate?: () => void;
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
    <div className="rounded-2xl border border-slate-700 bg-[#101425] p-4" style={{ margin: '16px 0', background: '#222', borderRadius: 12, padding: 16 }}>
      <h3 className="text-lg font-semibold mb-2" style={{ color: '#FFB300', fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>
        Crew Manifest Preview ({crew.length} crew members)
      </h3>
      <ul className="text-sm text-slate-200 space-y-1" style={{ color: '#fff', fontSize: 15, marginBottom: 12 }}>
        {crew.map((member, i) => (
          <li key={i}>{member.rank} {member.name} – {member.role}</li>
        ))}
      </ul>
      <button
        style={{ padding: '8px 18px', background: '#FFB300', color: '#222', border: 'none', borderRadius: 8, fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}
        onClick={onRegenerate}
      >
        Regenerate Crew Manifest
      </button>
    </div>
  );
}
