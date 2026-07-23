import React from 'react';
import { Avatar } from './Avatar';
import type { Label, TeamMember, TaskPriority } from '../types';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilterLabelId: string | null;
  setSelectedFilterLabelId: (id: string | null) => void;
  selectedFilterMemberId: string | null;
  setSelectedFilterMemberId: (id: string | null) => void;
  selectedFilterPriority: TaskPriority | null;
  setSelectedFilterPriority: (priority: TaskPriority | null) => void;
  labels: Label[];
  members: TeamMember[];
}

const PRIORITY_BADGE_STYLES = {
  low: 'text-zinc-400 border-zinc-800/80 hover:border-zinc-700 bg-zinc-900/20',
  normal: 'text-blue-400 border-blue-900/30 hover:border-blue-800/50 bg-blue-950/10',
  high: 'text-red-400 border-red-900/30 hover:border-red-800/50 bg-red-950/10',
};

const PRIORITY_OPTIONS: TaskPriority[] = ['low', 'normal', 'high'];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedFilterLabelId,
  setSelectedFilterLabelId,
  selectedFilterMemberId,
  setSelectedFilterMemberId,
  selectedFilterPriority,
  setSelectedFilterPriority,
  labels,
  members,
}) => {
  return (
    <div className="px-8 py-2 border-b border-zinc-900/60 bg-zinc-950 flex items-center gap-3 overflow-x-auto custom-scrollbar shrink-0">
      
      {/* Search Input Box */}
      <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 w-56 focus-within:border-indigo-500 transition-colors shrink-0">
        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider select-none">Find:</span>
        <input type="text" placeholder="Search issues by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-xs text-zinc-200 outline-none placeholder-zinc-600 w-full" />
        {searchQuery && <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-zinc-300 text-[10px] font-mono cursor-pointer shrink-0 px-0.5">✕</button>}
      </div>
      
      <div className="h-4 w-px bg-zinc-800 shrink-0 mx-1" />
      
      {/* Reset Control */}
      <button 
        onClick={() => { 
          setSelectedFilterLabelId(null); 
          setSelectedFilterMemberId(null); 
          setSelectedFilterPriority(null); 
        }} 
        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer shrink-0 ${
          selectedFilterLabelId === null && selectedFilterMemberId === null && selectedFilterPriority === null
            ? 'bg-zinc-100 text-zinc-900 border-white font-semibold' 
            : 'text-zinc-400 border-zinc-800 bg-zinc-900/40 hover:text-zinc-200'
        }`}
      >
        All Issues
      </button>

      {/* Priority Indicators */}
      <div className="h-4 w-px bg-zinc-800 shrink-0 mx-1" />
      <span className="text-[9px] uppercase font-bold text-zinc-300 bg-zinc-900/80 px-2 py-0.5 rounded-md border border-zinc-800/40 tracking-widest select-none shrink-0 shadow-xs">
        Priority
      </span>
      
      {PRIORITY_OPTIONS.map((prio) => (
        <button
          key={prio}
          onClick={() => setSelectedFilterPriority(prio === selectedFilterPriority ? null : prio)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
            selectedFilterPriority === prio
              ? 'bg-zinc-100 text-zinc-900 border-white font-semibold shadow-md scale-102'
              : PRIORITY_BADGE_STYLES[prio]
          }`}
        >
          {prio}
        </button>
      ))}

      {/* Tag Labels Sorted */}
      <div className="h-4 w-px bg-zinc-800 shrink-0 mx-1" />
      <span className="text-[9px] uppercase font-bold text-zinc-300 bg-zinc-900/80 px-2 py-0.5 rounded-md border border-zinc-800/40 tracking-widest select-none shrink-0 shadow-xs">
        Tags
      </span>
      
      {[...labels]
        .sort((a, b) => a.name.localeCompare(b.name)) // Alphabetical Sorting
        .map((lbl) => (
          <button 
            key={lbl.id} 
            onClick={() => setSelectedFilterLabelId(lbl.id === selectedFilterLabelId ? null : lbl.id)} 
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedFilterLabelId === lbl.id 
                ? 'bg-zinc-100 text-zinc-900 border-white font-semibold shadow-md scale-102' 
                : 'text-zinc-400 border-zinc-800/80 bg-zinc-900/20 hover:text-zinc-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lbl.color }} /> {lbl.name}
          </button>
      ))}

      {/* Assignee Profiles Sorted */}
      <div className="h-4 w-px bg-zinc-800 shrink-0 mx-1" />
      <span className="text-[9px] uppercase font-bold text-zinc-300 bg-zinc-900/80 px-2 py-0.5 rounded-md border border-zinc-800/40 tracking-widest select-none shrink-0 shadow-xs">
        Assignee
      </span>

      {[...members]
        .sort((a, b) => a.name.localeCompare(b.name)) // Alphabetical Sorting
        .map((member) => (
          <button 
            key={member.id} 
            onClick={() => setSelectedFilterMemberId(member.id === selectedFilterMemberId ? null : member.id)} 
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedFilterMemberId === member.id 
                ? 'bg-zinc-100 text-zinc-900 border-white font-semibold shadow-md scale-102' 
                : 'text-zinc-400 border-zinc-800/80 bg-zinc-900/20 hover:text-zinc-200'
            }`}
          >
            <Avatar name={member.name} color={member.color} size="sm" />
            <span>{member.name}</span>
          </button>
      ))}
    </div>
  );
};
