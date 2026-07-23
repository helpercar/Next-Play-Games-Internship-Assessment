import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Avatar } from './Avatar';
import type { TeamMember } from '../types';

// Component props interface managing the cached team list array, creation callbacks, and parent sidebar visibility states
interface TeamManagerProps {
  members: TeamMember[];
  onMemberAdded: (newMember: TeamMember) => void;
  isSidebarExpanded: boolean;
}

// Preset color hex strings used to automatically assign a background theme to new teammate avatars
const PRESET_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'];

export const TeamManager: React.FC<TeamManagerProps> = ({ 
  members, 
  onMemberAdded, 
  isSidebarExpanded 
}) => {
  const [name, setName] = useState('');
  const [showInput, setShowInput] = useState(false); // Controls visibility of the inline creation text field

  // Action function managing database submission for a new team profile row
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Selects a random background color from the array palette matrix
    const randomColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];

    // Push new member configuration directly to the secure Supabase table
    const { data, error } = await supabase
      .from('team_members')
      .insert([{ name: name.trim(), color: randomColor }])
      .select()
      .single();

    if (!error && data) {
      onMemberAdded(data as TeamMember); // Append new item row directly into global state cache
      setName('');
      setShowInput(false); // Collapse the input form field row cleanly
    } else if (error) {
      console.error(error.message);
    }
  };

  return (
    // Outer section container anchored cleanly to the bottom base lane layout of the sidebar panel frame
    <div className="w-full border-t border-zinc-900/60 pt-4 flex flex-col gap-3">
      
      {/* Modifies alignment properties depending on sidebar layout collapse states */}
      <div className={`flex items-center justify-between text-zinc-500 font-semibold text-[11px] uppercase tracking-wider ${isSidebarExpanded ? 'px-3' : 'justify-center'}`}>
        {isSidebarExpanded ? (
          <span className="flex items-center gap-2"><Users size={12} /> Team Profiles</span>
        ) : (
          <Users size={14} aria-label="Team Management" className="cursor-pointer" onClick={() => isSidebarExpanded && setShowInput(true)} />
        )}
        
        {/* Toggle plus button shortcut icon—only accessible when sidebar is fully expanded */}
        {isSidebarExpanded && (
          <button 
            onClick={() => setShowInput(!showInput)} 
            className="hover:text-zinc-300 p-0.5 rounded hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Conditionally mounted only when expanded and active */}
      {showInput && isSidebarExpanded && (
        <form onSubmit={handleAddMember} className="px-2 animate-fade-in">
          <input 
            type="text" 
            placeholder="Teammate name..." 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            autoFocus 
            className="w-full bg-zinc-950 text-zinc-200 border border-zinc-800 text-xs rounded-lg p-2 outline-none focus:border-indigo-500 placeholder-zinc-600" 
          />
        </form>
      )}

      {/* Scrolls independently if roster overflows */}
      <div className={`flex ${isSidebarExpanded ? 'flex-col gap-1 px-1' : 'flex-col items-center gap-2'} max-h-36 overflow-y-auto custom-scrollbar`}>
        {members.map((member) => (
          <div 
            key={member.id} 
            className={`flex items-center gap-3 p-1.5 rounded-lg text-xs font-medium text-zinc-400 ${isSidebarExpanded ? 'w-full' : 'justify-center'}`}
          >
            {/* Component generates initials and matches background color stored keys */}
            <Avatar name={member.name} color={member.color} />
            
            {/* Explicit text label labels vanish immediately if sidebar contracts minimized */}
            {isSidebarExpanded && <span className="truncate text-zinc-300">{member.name}</span>}
          </div>
        ))}
      </div>

    </div>
  );
};
