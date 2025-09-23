import React, { useState, useEffect, useRef, useMemo } from "react";
import { generateCrewManifest } from "../utils/reportGen";
import { CrewMember } from "../types";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function CrewManifestPanel({ 
  count = 8, 
  onCrewChange, 
  onClose
}: { 
  count?: number; 
  onCrewChange?: (crew: any[]) => void;
  onClose?: () => void;
}) {
  type Department = "Command" | "Operations" | "Engineering" | "Science" | "Medical" | "Security" | "Other";
  type UICrewMember = CrewMember & { id: string; department: Department; locked?: boolean };

  const STORAGE_KEY = "wcr_crew_manifest_v1";

  const uid = () => {
    try {
      // Prefer standards if available
      if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) return (crypto as any).randomUUID();
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const buf = new Uint8Array(16);
        crypto.getRandomValues(buf);
        // RFC4122-ish v4 formatting
        buf[6] = (buf[6] & 0x0f) | 0x40;
        buf[8] = (buf[8] & 0x3f) | 0x80;
        const toHex = (n:number) => n.toString(16).padStart(2,'0');
        const b = Array.from(buf, toHex).join('');
        return `${b.slice(0,8)}-${b.slice(8,12)}-${b.slice(12,16)}-${b.slice(16,20)}-${b.slice(20)}`;
      }
    } catch {}
    // Fallback: time + random
    return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  };

  const DEFAULT_ROLES = useMemo(() => [
    "Sensor Technician","Warp Specialist","EPS Engineer","Structural Engineer","Deflector Officer","Transporter Chief","Operations",
    "Medical Officer","Science Officer","Security Officer","Helm Officer","Communications Officer","Tactical Officer","Chief Engineer","Chief Science Officer"
  ], []);

  const roleToDepartment = (role: string): Department => {
    const r = role.toLowerCase();
    if (r.includes("captain") || r.includes("commander") || r.includes("command") || r.includes("xo") || r.includes("first officer")) return "Command";
    if (r.includes("ops") || r.includes("operations") || r.includes("tactical") || r.includes("helm") || r.includes("communications") || r.includes("shield") || r.includes("holodeck")) return "Operations";
    if (r.includes("warp") || r.includes("eps") || r.includes("engineer") || r.includes("structural") || r.includes("deflector") || r.includes("transporter") || r.includes("impulse") || r.includes("dilithium")) return "Engineering";
    if (r.includes("science") || r.includes("sensor") || r.includes("astrometric") || r.includes("cartography") || r.includes("subspace") || r.includes("quantum")) return "Science";
    if (r.includes("medical") || r.includes("doctor") || r.includes("medic") || r.includes("nurse") || r.includes("bio")) return "Medical";
    if (r.includes("security") || r.includes("safety") || r.includes("brig")) return "Security";
    return "Other";
  };

  const augment = (list: CrewMember[]): UICrewMember[] =>
    list.map(cm => ({ ...cm, id: uid(), department: roleToDepartment(cm.role), locked: false }));

  // Local role–rank constraints for UI operations
  const enforceRoleRankConstraints = (role: string, rank: string): { role: string; rank: string } => {
    const officerRanks = [
      "Ensign",
      "Lieutenant Junior Grade",
      "Lieutenant",
      "Lieutenant Commander",
      "Commander"
    ];
    const seniorForCaptain = ["Lieutenant Commander", "Commander", "Captain"];
    const rLower = role.toLowerCase();
    if (rLower.includes("ship's captain") || rLower === "captain" || (rLower.includes(" captain") && rLower.includes("ship"))) {
      if (!seniorForCaptain.includes(rank)) rank = seniorForCaptain[0];
    }
    if (rLower.includes("officer")) {
      if (!officerRanks.includes(rank)) rank = officerRanks[0];
    }
    return { role, rank };
  };

  const saveCrew = (list: UICrewMember[]) => {
    try {
      const toSave = list.map(({ id, department, locked, ...rest }) => ({ id, department, locked: !!locked, ...rest }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, crew: toSave }));
    } catch {}
  };
  const loadCrew = (): UICrewMember[] | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed?.v !== 1 || !Array.isArray(parsed?.crew)) return null;
      return parsed.crew as UICrewMember[];
    } catch { return null; }
  };

  // Ensure coverage across departments by adjusting roles for a minimal presence
  const ensureDepartmentCoverage = (list: UICrewMember[]): UICrewMember[] => {
    const need: Department[] = ["Command","Operations","Medical","Security","Science"];
    const have = new Set(list.map(c => c.department));
    const suggestions: Record<Department, string[]> = {
      Command: ["Ship's Captain","First Officer","Chief of Operations"],
      Operations: ["Tactical Officer","Helm Officer","Communications Officer","Operations"],
      Medical: ["Medical Officer","Chief Medical Officer","Nurse"],
      Security: ["Security Officer","Chief Security Officer"],
      Science: ["Science Officer","Chief Science Officer","Astrometrics Specialist"],
      Engineering: ["Engineer","Chief Engineer","Warp Specialist"],
      Other: ["Crewman"]
    };
    const next = [...list];
    for (const dept of need) {
      if (!have.has(dept)) {
        // Pick the first non-locked member currently in a dominant dept to repurpose
        const idx = next.findIndex(c => !c.locked && (c.department === "Engineering" || c.department === "Other"));
        if (idx !== -1) {
          const role = suggestions[dept][0];
          const before = next[idx].rank;
          const constrained = enforceRoleRankConstraints(role, next[idx].rank);
          next[idx] = { ...next[idx], role: constrained.role, rank: constrained.rank, department: dept };
          if (constrained.rank !== before) {
            setConstraintMsg(`Adjusted rank to ${constrained.rank} for role “${constrained.role}”.`);
            setTimeout(() => setConstraintMsg(""), 2000);
          }
        }
      }
    }
    return next;
  };

  const prevCountRef = useRef<number>(count);
  const [crew, setCrew] = useState<UICrewMember[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<Set<Department>>(new Set());
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftRole, setDraftRole] = useState<string>("");
  const [targetSize, setTargetSize] = useState<number>(count);
  const [constraintMsg, setConstraintMsg] = useState<string>("");

  // Initialize crew (prefer persisted)
  useEffect(() => {
    const persisted = loadCrew();
    if (persisted && persisted.length) {
      let changed = false;
      const normalized = persisted.map(c => {
        const constrained = enforceRoleRankConstraints(c.role, c.rank);
        if (constrained.rank !== c.rank || constrained.role !== c.role) changed = true;
        return { ...c, role: constrained.role, rank: constrained.rank, department: roleToDepartment(constrained.role) };
      });
      const adjusted = ensureDepartmentCoverage(normalized);
      setCrew(adjusted);
      onCrewChange?.(adjusted);
      if (changed) {
        saveCrew(adjusted);
        setConstraintMsg('Some crew ranks were adjusted to meet role constraints.');
        setTimeout(()=>setConstraintMsg(''), 2500);
      }
    } else {
      const generated = ensureDepartmentCoverage(augment(generateCrewManifest(count)));
      setCrew(generated);
      onCrewChange?.(generated);
      saveCrew(generated);
    }
    prevCountRef.current = count;
  }, []);

  // Update crew when count changes
  useEffect(() => {
    if (count !== prevCountRef.current) {
      const generated = ensureDepartmentCoverage(augment(generateCrewManifest(count)));
      setCrew(generated);
      onCrewChange?.(generated);
      saveCrew(generated);
      prevCountRef.current = count;
      setTargetSize(count);
    }
  }, [count]);

  // Filters and search
  const DEPTS: Department[] = ["Command","Operations","Engineering","Science","Medical","Security","Other"];
  const toggleDept = (dept: Department) => {
    setSelectedDepts(prev => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept); else next.add(dept);
      return next;
    });
  };
  const clearFilters = () => setSelectedDepts(new Set());

  const visibleCrew = useMemo(() => {
    const term = search.trim().toLowerCase();
    return crew.filter(cm => (selectedDepts.size === 0 || selectedDepts.has(cm.department)))
               .filter(cm => term === "" || `${cm.rank} ${cm.name} ${cm.role}`.toLowerCase().includes(term));
  }, [crew, selectedDepts, search]);

  // Shuffle order (non-destructive)
  const shuffleCrew = () => {
    const arr = [...crew];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setCrew(arr);
    onCrewChange?.(arr);
    saveCrew(arr);
  };

  // Drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = crew.findIndex(c => c.id === active.id);
    const newIndex = crew.findIndex(c => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(crew, oldIndex, newIndex);
    setCrew(reordered);
    onCrewChange?.(reordered);
    saveCrew(reordered);
  };

  // Inline role editing
  const startEdit = (id: string, currentRole: string) => {
    setEditingId(id);
    setDraftRole(currentRole);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraftRole("");
  };
  const commitEdit = () => {
    if (!editingId) return;
    const value = draftRole.trim();
    if (!value) { cancelEdit(); return; }
    const updated = crew.map(c => {
      if (c.id !== editingId) return c;
      const before = c.rank;
      const constrained = enforceRoleRankConstraints(value, c.rank);
      if (constrained.rank !== before) {
        setConstraintMsg(`Adjusted rank to ${constrained.rank} for role “${constrained.role}”.`);
        setTimeout(() => setConstraintMsg(""), 2000);
      }
      return { ...c, role: constrained.role, rank: constrained.rank, department: roleToDepartment(constrained.role) };
    });
    setCrew(updated);
    onCrewChange?.(updated);
    saveCrew(updated);
    cancelEdit();
  };

  const handleRegenerateClick = () => {
    // Regenerate only unlocked slots and preserve locked members in place
    const lockedCount = crew.filter(c => c.locked).length;
    const toGenerate = Math.max(0, (crew.length || count) - lockedCount);
    const newOnes = augment(generateCrewManifest(toGenerate));
    let cursor = 0;
    const merged = crew.map(c => c.locked ? c : (() => {
      const nextOne = newOnes[cursor++];
      return { ...nextOne, id: c.id }; // preserve position id for stable DnD ordering
    })());
    const adjusted = ensureDepartmentCoverage(merged);
    setCrew(adjusted);
    onCrewChange?.(adjusted);
    saveCrew(adjusted);
  };

  const handleResetCrew = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    const generated = ensureDepartmentCoverage(augment(generateCrewManifest(count)));
    setCrew(generated);
    onCrewChange?.(generated);
    saveCrew(generated);
  };

  const applyResize = () => {
    const locked = crew.filter(c => c.locked);
    const unlocked = crew.filter(c => !c.locked);
    const minAllowed = locked.length; // cannot shrink below locked
    const desired = Math.max(minAllowed, Math.min(20, Math.max(1, Math.floor(targetSize || crew.length))));
    if (desired === crew.length) return;
    if (desired > crew.length) {
      const toAdd = desired - crew.length;
      const additions = augment(generateCrewManifest(toAdd));
      const next = ensureDepartmentCoverage([...crew, ...additions]);
      setCrew(next);
      onCrewChange?.(next);
      saveCrew(next);
      return;
    }
    // desired < crew.length, remove from unlocked (end-first)
    const toRemove = crew.length - desired;
    const nextUnlocked = [...unlocked];
    const keepUnlocked = nextUnlocked.slice(0, Math.max(0, nextUnlocked.length - toRemove));
    // Preserve original order: interleave locked in their original positions
    const lockedIds = new Set(locked.map(c => c.id));
    const keepIds = new Set([...locked.map(c => c.id), ...keepUnlocked.map(c => c.id)]);
    const next = crew.filter(c => keepIds.has(c.id));
    const adjusted = ensureDepartmentCoverage(next);
    setCrew(adjusted);
    onCrewChange?.(adjusted);
    saveCrew(adjusted);
  };

  function SortableRow({ member }: { member: UICrewMember }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: member.id });
    const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };
    const isEditing = editingId === member.id;
    return (
  <li ref={setNodeRef} style={style} className="flex items-start gap-2 px-2 py-1 rounded-md bg-pink-500/5 border border-pink-400/20">
        <button aria-label="Drag handle" title="Drag to reorder" className="cursor-grab active:cursor-grabbing text-pink-300 hover:text-pink-200 touch-none select-none" {...attributes} {...listeners}>
          ≡
        </button>
        <div className="flex-1 text-slate-100 min-w-0">
          <span
            className="font-medium inline-block align-middle whitespace-normal break-words sm:whitespace-nowrap sm:truncate sm:max-w-[60%]"
            title={`${member.rank} ${member.name}`}
          >
            {member.rank} {member.name}
          </span>
          <span className="mx-2 text-pink-400 hidden sm:inline">–</span>
          {!isEditing ? (
            <button
              className="crew-role-btn px-1.5 py-0.5 rounded bg-pink-500/20 border border-pink-400/30 text-pink-100 hover:bg-pink-500/30 text-xs sm:text-sm w-full sm:w-auto sm:max-w-none overflow-hidden text-ellipsis align-middle mt-1 sm:mt-0"
              onClick={() => startEdit(member.id, member.role)}
              title="Edit role"
            >
              {member.role}
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 relative z-10">
              <input
                className="px-2 py-1 rounded bg-slate-800 border border-pink-400/40 text-slate-100 outline-none focus:ring-2 focus:ring-pink-400"
                list="roles-list"
                value={draftRole}
                onChange={(e) => setDraftRole(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
                autoFocus
              />
              <button className="px-2 py-1 rounded bg-pink-500 text-black border border-pink-400 font-bold text-xs" onClick={commitEdit}>Save</button>
              <button className="px-2 py-1 rounded bg-slate-700 text-pink-200 border border-pink-400/40 text-xs" onClick={cancelEdit}>Cancel</button>
            </span>
          )}
        </div>
        <span className="text-xs text-pink-300 border border-pink-400/30 rounded px-1.5 py-0.5 whitespace-nowrap">{member.department}</span>
        <button
          className={`ml-1 px-2 py-0.5 rounded border text-xs ${member.locked ? 'bg-pink-500 text-black border-pink-400' : 'bg-pink-500/10 text-pink-200 border-pink-400/40 hover:bg-pink-500/20'}`}
          onClick={() => {
            const updated = crew.map(c => c.id === member.id ? { ...c, locked: !c.locked } : c);
            setCrew(updated);
            onCrewChange?.(updated);
            saveCrew(updated);
          }}
          title={member.locked ? 'Unlock (allow regenerate)' : 'Lock (preserve on regenerate)'}
          aria-pressed={!!member.locked}
        >
          {member.locked ? 'Locked' : 'Lock'}
        </button>
      </li>
    );
  }

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
      <h3 className="text-lg font-bold mb-2 text-pink-300">Crew Manifest ({crew.length})</h3>
      {constraintMsg && (
        <div className="mb-2 text-[12px] text-amber-300 bg-slate-900/50 border border-amber-400/40 rounded px-2 py-1">
          {constraintMsg}
        </div>
      )}

      {/* Toolbar: Filters + Search + Actions */}
  <div className="mb-3 flex flex-col gap-2 crew-toolbar">
        <div className="text-pink-200 text-xs flex items-center gap-1">
          <span>Filter by department:</span>
          <button
            type="button"
            className="ml-auto lcars-btn"
            title="About the Crew Panel"
            onClick={()=>{
              window.dispatchEvent(new CustomEvent('wcr-open-help', { detail: { section: 'crew-panel' } }));
            }}
            aria-label="Crew panel help"
          >ℹ️</button>
        </div>
        <div className="flex flex-wrap gap-1">
          <button className={`px-2 py-1 text-xs rounded border ${selectedDepts.size === 0 ? 'bg-pink-500 text-black border-pink-400' : 'bg-pink-500/10 text-pink-200 border-pink-400/40 hover:bg-pink-500/20'}`} onClick={clearFilters} title="Show all departments">All</button>
          {DEPTS.map(d => (
            <button key={d} className={`px-2 py-1 text-xs rounded border ${selectedDepts.has(d) ? 'bg-pink-500 text-black border-pink-400' : 'bg-pink-500/10 text-pink-200 border-pink-400/40 hover:bg-pink-500/20'}`} onClick={() => toggleDept(d)}>{d}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            className="flex-1 px-2 py-1 rounded bg-slate-900/60 border border-pink-400/40 text-slate-100 placeholder-pink-300/50"
            placeholder="Search name or role"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/60 border border-pink-400/30 text-pink-200 w-full sm:w-auto">
            <label className="text-xs" htmlFor="crew-size">Crew size</label>
            <input
              id="crew-size"
              type="number"
              min={Math.max(1, crew.filter(c=>c.locked).length)}
              max={20}
              value={targetSize}
              onChange={(e)=> setTargetSize(Number(e.target.value))}
              className="w-14 px-2 py-1 rounded bg-slate-900/60 border border-pink-400/40 text-slate-100"
              title="Set desired crew size; locked members are preserved"
            />
            <button
              className="px-2 py-1 rounded bg-pink-600 text-black border border-pink-400 font-bold text-xs"
              onClick={applyResize}
              title="Apply crew size"
            >Apply</button>
            <span className="text-[11px] opacity-80 whitespace-nowrap">Locked: {crew.filter(c=>c.locked).length}</span>
          </div>
          {targetSize < crew.filter(c=>c.locked).length && (
            <div className="text-[11px] text-amber-300 -mt-1 w-full">
              Target is below locked count; will clamp to {crew.filter(c=>c.locked).length}.
            </div>
          )}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="px-3 py-1.5 rounded-md bg-pink-500 hover:bg-pink-400 text-black border border-pink-400 font-bold text-sm flex-1 sm:flex-none" onClick={shuffleCrew}>Shuffle</button>
            <button className="px-3 py-1.5 rounded-md bg-pink-500/20 hover:bg-pink-500/30 text-pink-100 border border-pink-400/60 font-bold text-sm flex-1 sm:flex-none" onClick={handleRegenerateClick}>Regenerate</button>
            <button className="px-3 py-1.5 rounded-md bg-slate-700/70 hover:bg-slate-700 text-pink-200 border border-pink-400/40 font-bold text-sm flex-1 sm:flex-none" onClick={handleResetCrew} title="Reset crew to a fresh random set and clear edits">Reset</button>
          </div>
        </div>
      </div>

      {/* Roles datalist for typeahead */}
      <datalist id="roles-list">
        {DEFAULT_ROLES.map(r => (<option key={r} value={r} />))}
      </datalist>

      {/* Reorderable list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleCrew.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <ul className="text-[15px] text-slate-100 space-y-1 mb-3 overscroll-contain">
            {visibleCrew.map((member) => (
              <SortableRow key={member.id} member={member} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
