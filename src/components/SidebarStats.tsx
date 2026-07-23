import React from 'react';
import { BarChart2, ListTodo, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Task } from '../types';

interface SidebarStatsProps {
  tasks: Task[];
  isSidebarExpanded: boolean;
}

export const SidebarStats: React.FC<SidebarStatsProps> = ({ tasks, isSidebarExpanded }) => {
  // Calculate the real-time metrics here out of view
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === 'done').length;
  
  const overdueTasksCount = tasks.filter((t) => {
    if (!t.due_date || t.status === 'done') return false;
    const [year, month, day] = t.due_date.split('-').map(Number);
    const taskDate = new Date(year, month - 1, day);
    taskDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return taskDate.getTime() < today.getTime();
  }).length;

  return (
    <div className="flex flex-col gap-3 border-t border-zinc-900/80 pt-4 w-full">
      {/* Title Segment */}
      <div className={`flex items-center gap-2 text-zinc-500 font-semibold text-[10px] uppercase tracking-wider ${
        isSidebarExpanded ? 'px-3' : 'justify-center'
      }`}>
        <BarChart2 size={12} className="shrink-0" />
        {isSidebarExpanded && <span>Workspace Stats</span>}
      </div>

      {/* Stats Stack Track */}
      <div className={`flex flex-col ${isSidebarExpanded ? 'gap-2 px-1' : 'gap-3 items-center'}`}>
        
        {/* Total Backlog */}
        <div title={`Total Backlog: ${totalTasksCount} tasks`} className={`flex items-center text-xs text-zinc-400 p-1.5 rounded-lg bg-zinc-950/20 border border-transparent transition-colors ${
          isSidebarExpanded ? 'justify-between w-full px-3 bg-zinc-950/40 border-zinc-900/60' : 'justify-center w-9 h-9'
        }`}>
          <div className="flex items-center gap-2">
            <ListTodo size={14} className="text-indigo-400 shrink-0" />
            {isSidebarExpanded && <span>Total Backlog</span>}
          </div>
          <span className={`font-mono text-zinc-200 font-semibold ${isSidebarExpanded ? 'text-xs' : 'text-[11px]'}`}>
            {totalTasksCount}
          </span>
        </div>

        {/* Completed Tasks */}
        <div title={`Completed: ${completedTasksCount} tasks`} className={`flex items-center text-xs text-zinc-400 p-1.5 rounded-lg bg-zinc-950/20 border border-transparent transition-colors ${
          isSidebarExpanded ? 'justify-between w-full px-3 bg-zinc-950/40 border-zinc-900/60' : 'justify-center w-9 h-9'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            {isSidebarExpanded && <span>Completed</span>}
          </div>
          <span className="font-mono text-emerald-400 font-semibold">{completedTasksCount}</span>
        </div>

        {/* Overdue Critical Alert Warning */}
        <div 
          title={`Overdue: ${overdueTasksCount} tasks`} 
          className={`flex items-center text-xs text-zinc-400 p-1.5 rounded-lg bg-zinc-950/20 border border-transparent transition-colors ${
            isSidebarExpanded ? 'justify-between w-full px-3 bg-zinc-950/40 border-zinc-900/60' : 'justify-center w-9 h-9'
          } ${overdueTasksCount > 0 && isSidebarExpanded ? 'bg-red-950/10 border-red-950/30' : ''}`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className={overdueTasksCount > 0 ? "text-red-400 shrink-0" : "text-zinc-600 shrink-0"} />
            {isSidebarExpanded && <span className={overdueTasksCount > 0 ? "text-red-400/90" : ""}>Overdue Alert</span>}
          </div>
          <span className={`font-mono font-semibold ${overdueTasksCount > 0 ? 'text-red-400' : 'text-zinc-600'}`}>
            {overdueTasksCount}
          </span>
        </div>

      </div>
    </div>
  );
};
