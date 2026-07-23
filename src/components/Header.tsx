import React from 'react';
import { PanelLeftOpen } from 'lucide-react';
import { LabelManager } from './LabelManager';
import type { Label, TaskStatus } from '../types';

// Component props managing the sidebar open triggers, label creation events, and new task initialization
interface HeaderProps {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (expanded: boolean) => void;
  onLabelAdded: (newLabel: Label) => void;
  setActiveCreationStatus: (status: TaskStatus) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarExpanded,
  setIsSidebarExpanded,
  onLabelAdded,
  setActiveCreationStatus,
}) => {
  return (
    // Top horizontal toolbar container locked at a fixed height (h-14) with a subtle bottom border
    <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-8 bg-zinc-950 shrink-0">
      
      {/* Handles Sidebar Toggling and View Title */}
      <div className="flex items-center gap-4">
        {/* If the sidebar is closed/minimized, show the expansion toggle button */}
        {!isSidebarExpanded && (
          <button 
            onClick={() => setIsSidebarExpanded(true)} 
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 cursor-pointer shadow-xs transition-all" 
            title="Expand sidebar"
          >
            <PanelLeftOpen size={16} />
          </button>
        )}
        {/* Board Title Label */}
        <h2 className="text-sm font-semibold text-zinc-200">Project Backlog</h2>
      </div>

      {/* Housing global action configurations */}
      <div className="flex items-center gap-2">
        {/* Modular popover dropdown component letting users create brand new tag labels */}
        <LabelManager onLabelAdded={onLabelAdded} />
        
        {/* "+ New Task" trigger button—clicking sets active status to 'todo' which launches the creation modal overlay */}
        <button 
          onClick={() => setActiveCreationStatus('todo')} 
          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium transition-all cursor-pointer shadow-xs"
        >
          + New Task
        </button>
      </div>

    </header>
  );
};