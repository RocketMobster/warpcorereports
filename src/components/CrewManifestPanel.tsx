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
  onRegenerate,
  onClose
}: { 
  count?: number; 
  onCrewChange?: (crew: any[]) => void;
  onRegenerate?: () => void;
  onClose?: () => void;
}) {
  type Department = "Command" | "Operations" | "Engineering" | "Science" | "Medical" | "Security" | "Other";
  type UICrewMember = CrewMember & { id: string; department: Department };

  const STORAGE_KEY = "wcr_crew_manifest_v1";

  const DEFAULT_ROLES = useMemo(() => [
    "Sensor Technician","Warp Specialist","EPS Engineer","Structural Engineer","Deflector Officer","Transporter Chief","Operations",
    "Medical Officer","Science Officer","Security Officer","Helm Officer","Communications Officer","Tactical Officer","Chief Engineer","Chief Science Officer"
  ], []);

  const roleToDepartment = (role: string): Department => {
    const r = role.toLowerCase();
    if (r.includes("captain") || r.includes("commander") || r.includes("command")) return "Command";
    if (r.includes("ops") || r.includes("operations") || r.includes("tactical") || r.includes("helm") || r.includes("communications")) return "Operations";
    if (r.includes("warp") || r.includes("eps") || r.includes("engineer") || r.includes("structural") || r.includes("deflector") || r.includes("transporter")) return "Engineering";
    if (r.includes("science") || r.includes("sensor") || r.includes("astrometric") || r.includes("cartography")) return "Science";
    if (r.includes("medical") || r.includes("doctor") || r.includes("medic") || r.includes("nurse")) return "Medical";
    if (r.includes("security")) return "Security";
    return "Other";
  };

  const augment = (list: CrewMember[]): UICrewMember[] =>
    list.map(cm => ({ ...cm, id: crypto.randomUUID(), department: roleToDepartment(cm.role) }));

  const saveCrew = (list: UICrewMember[]) => {
    try {
      const toSave = list.map(({ id, department, ...rest }) => ({ id, department, ...rest }));
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

  const prevCountRef = useRef<number>(count);
  const [crew, setCrew] = useState<UICrewMember[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<Set<Department>>(new Set());
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftRole, setDraftRole] = useState<string>("");

  // Initialize crew (prefer persisted)
  useEffect(() => {
    const persisted = loadCrew();
    if (persisted && persisted.length) {
      setCrew(persisted);
      onCrewChange?.(persisted);
    } else {
      const generated = augment(generateCrewManifest(count));
      setCrew(generated);
      onCrewChange?.(generated);
      saveCrew(generated);
    }
    prevCountRef.current = count;
  }, []);

  // Update crew when count changes
  useEffect(() => {
    if (count !== prevCountRef.current) {
      const generated = augment(generateCrewManifest(count));
      setCrew(generated);
      onCrewChange?.(generated);
      saveCrew(generated);
      prevCountRef.current = count;
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
    useSensor(PointerSensor),
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
    const updated = crew.map(c => c.id === editingId ? { ...c, role: value, department: roleToDepartment(value) } : c);
    setCrew(updated);
    onCrewChange?.(updated);
    saveCrew(updated);
    cancelEdit();
  };

  const handleRegenerateClick = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    onRegenerate?.();
  };

  function SortableRow({ member }: { member: UICrewMember }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: member.id });
    const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };
    const isEditing = editingId === member.id;
    return (
      <li ref={setNodeRef} style={style} className="flex items-center gap-2 px-2 py-1 rounded-md bg-pink-500/5 border border-pink-400/20">
        <button aria-label="Drag handle" title="Drag to reorder" className="cursor-grab active:cursor-grabbing text-pink-300 hover:text-pink-200" {...attributes} {...listeners}>
          ≡
        </button>
        <div className="flex-1 text-slate-100">
          <span className="font-medium">{member.rank} {member.name}</span>
          <span className="mx-2 text-pink-400">–</span>
          {!isEditing ? (
            <button className="px-2 py-0.5 rounded bg-pink-500/20 border border-pink-400/30 text-pink-100 hover:bg-pink-500/30" onClick={() => startEdit(member.id, member.role)} title="Edit role">
              {member.role}
            </button>
          ) : (
            <span className="inline-flex items-center gap-2">
              <input
                className="px-2 py-1 rounded bg-slate-800/70 border border-pink-400/40 text-slate-100 outline-none focus:ring-2 focus:ring-pink-400"
                list="roles-list"
                value={draftRole}
                onChange={(e) => setDraftRole(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
                autoFocus
              />
              <button className="px-2 py-1 rounded bg-pink-500 text-black border border-pink-400 font-bold text-xs" onClick={commitEdit}>Save</button>
              <button className="px-2 py-1 rounded bg-slate-700/70 text-pink-200 border border-pink-400/40 text-xs" onClick={cancelEdit}>Cancel</button>
            </span>
          )}
        </div>
        <span className="text-xs text-pink-300 border border-pink-400/30 rounded px-1.5 py-0.5">{member.department}</span>
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

      {/* Toolbar: Filters + Search + Actions */}
      <div className="mb-3 flex flex-col gap-2">
        <div className="flex flex-wrap gap-1">
          <button className={`px-2 py-1 text-xs rounded border ${selectedDepts.size === 0 ? 'bg-pink-500 text-black border-pink-400' : 'bg-pink-500/10 text-pink-200 border-pink-400/40 hover:bg-pink-500/20'}`} onClick={clearFilters} title="Show all departments">All</button>
          {DEPTS.map(d => (
            <button key={d} className={`px-2 py-1 text-xs rounded border ${selectedDepts.has(d) ? 'bg-pink-500 text-black border-pink-400' : 'bg-pink-500/10 text-pink-200 border-pink-400/40 hover:bg-pink-500/20'}`} onClick={() => toggleDept(d)}>{d}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            className="flex-1 px-2 py-1 rounded bg-slate-900/60 border border-pink-400/40 text-slate-100 placeholder-pink-300/50"
            placeholder="Search name or role"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="px-3 py-1.5 rounded-md bg-pink-500 hover:bg-pink-400 text-black border border-pink-400 font-bold text-sm" onClick={shuffleCrew}>Shuffle</button>
          <button className="px-3 py-1.5 rounded-md bg-pink-500/20 hover:bg-pink-500/30 text-pink-100 border border-pink-400/60 font-bold text-sm" onClick={handleRegenerateClick}>Regenerate</button>
        </div>
      </div>

      {/* Roles datalist for typeahead */}
      <datalist id="roles-list">
        {DEFAULT_ROLES.map(r => (<option key={r} value={r} />))}
      </datalist>

      {/* Reorderable list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleCrew.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <ul className="text-[15px] text-slate-100 space-y-1 mb-3">
            {visibleCrew.map((member) => (
              <SortableRow key={member.id} member={member} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
