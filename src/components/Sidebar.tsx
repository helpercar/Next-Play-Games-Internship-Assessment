import React from 'react';
import { LayoutDashboard, PanelLeftClose } from 'lucide-react';
import { SidebarStats } from './SidebarStats';
import { TeamManager } from './TeamManager';
import type { Task, TeamMember } from '../types';

interface SidebarProps {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (expanded: boolean) => void;
  tasks: Task[];
  teamMembers: TeamMember[];
  onMemberAdded: (newMember: TeamMember) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarExpanded,
  setIsSidebarExpanded,
  tasks,
  teamMembers,
  onMemberAdded,
}) => {
  return (
    <aside className={`border-r border-zinc-900 bg-zinc-900/20 p-4 flex flex-col justify-between transition-all duration-200 shrink-0 ${
      isSidebarExpanded ? 'w-64' : 'w-16 items-center'
    }`}>
      <div className="flex flex-col gap-6 w-full">
        {/* Branding Logo & Collapse Trigger */}
        <div className="flex items-center justify-between py-1 w-full relative h-8 overflow-hidden">
          <div className="flex items-center gap-2 overflow-hidden shrink-0">
            <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center text-xs font-bold font-mono shrink-0 shadow-sm">🚀</div>
            <span className={`font-semibold text-sm tracking-tight text-zinc-200 transition-all duration-200 select-none whitespace-nowrap ${
              isSidebarExpanded ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0 pointer-events-none'
            }`}>
              Linear Workspace
            </span>
          </div>
          {isSidebarExpanded && (
            <button onClick={() => setIsSidebarExpanded(false)} className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md hover:bg-zinc-900 transition-all absolute right-0 top-1 cursor-pointer">
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* Tab Controls */}
        <nav className="flex flex-col gap-2 w-full">
          <button title="Kanban Board" className={`flex items-center text-sm font-medium rounded-lg bg-zinc-900 text-zinc-200 border border-zinc-800 cursor-pointer transition-all duration-200 group overflow-hidden ${
            isSidebarExpanded ? 'px-3 py-2 gap-3 w-full' : 'h-9 w-9 p-0 justify-center mx-auto'
          }`}>
            <LayoutDashboard size={16} className="shrink-0" />
            <span className={`transition-all duration-200 truncate whitespace-nowrap text-left ${isSidebarExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0 pointer-events-none'}`}>
              Kanban Board
            </span>
          </button>
        </nav>

        {/* Modular Stats Component */}
        <SidebarStats tasks={tasks} isSidebarExpanded={isSidebarExpanded} />
      </div>

      {/* Team Profiles Directory */}
      {isSidebarExpanded && (
        <TeamManager members={teamMembers} onMemberAdded={onMemberAdded} isSidebarExpanded={isSidebarExpanded} />
      )}
    </aside>
  );
};
