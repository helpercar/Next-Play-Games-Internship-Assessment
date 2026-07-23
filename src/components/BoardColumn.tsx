import React from 'react';
import { Plus } from 'lucide-react';
import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import type { Task, Column, TeamMember, Label } from '../types';

// Component props to receive columns, task items, global metadata caches, and event actions
interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  teamMembers: TeamMember[];
  labels: Label[];
  onAddTaskClick: () => void;
  onDeleteTaskClick: (task: Task) => void;
  onTaskSelect: (task: Task) => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({ 
  column, 
  tasks, 
  teamMembers, 
  labels, 
  onAddTaskClick, 
  onDeleteTaskClick, 
  onTaskSelect 
}) => {
  return (
    // Fixed-width tracking track column structured to snap nicely inside a horizontal board canvas
    <div className="flex flex-col w-72 bg-zinc-950/50 border border-zinc-900 rounded-xl p-3 h-[calc(100vh-120px)]">
      
      {/* Column Header: Displays title, total item count indicator badge, and action trigger shortcuts */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-300">{column.title}</h3>
          <span className="bg-zinc-900 text-zinc-500 text-xs font-bold px-2 py-0.5 rounded-full border border-zinc-800">
            {tasks.length}
          </span>
        </div>
        <button 
          onClick={onAddTaskClick} 
          className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Drag & Drop Context Zone: Listens for background cross-track drag drop gestures */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef} 
            {...provided.droppableProps} 
            className={`flex flex-col gap-2 overflow-y-auto flex-grow pb-4 custom-scrollbar rounded-lg transition-colors p-1 ${ 
              snapshot.isDraggingOver ? 'bg-zinc-900/20' : '' 
            }`}
          >
            {/* Task Card Loop: Maps out items belonging to this column track status slot */}
            {tasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                index={index} 
                labels={labels} 
                teamMembers={teamMembers} 
                onDeleteClick={() => onDeleteTaskClick(task)} 
                onCardClick={() => onTaskSelect(task)} 
              />
            ))}
            {provided.placeholder} {/* Reserves visual dimension layout blocks during dragging */}

            {/* Empty State Action Container: UI shortcut lets users tap blank space to spin up modal */}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div 
                onClick={onAddTaskClick} 
                className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg h-24 text-zinc-600 hover:text-zinc-500 hover:border-zinc-700 cursor-pointer transition-colors"
              >
                <p className="text-xs">+ Add task</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
