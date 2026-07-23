import React from 'react';
import { Calendar, Trash2, Clock } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import { Avatar } from './Avatar';
import type { Task, TeamMember, Label } from '../types';

interface TaskCardProps {
  task: Task;
  index: number;
  onDeleteClick: () => void;
  teamMembers: TeamMember[];
  onCardClick: () => void;
  labels: Label[];
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  index, 
  onDeleteClick, 
  teamMembers, 
  onCardClick, 
  labels 
}) => {
  const priorityColors = {
    low: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    normal: 'bg-blue-950/40 text-blue-400 border-blue-900/50',
    high: 'bg-red-950/40 text-red-400 border-red-900/50',
  };

  // Gather all matching data references from the multi-item arrays
  const cardLabels = labels.filter((l) => task.label_ids?.includes(l.id));
  const cardAssignees = teamMembers.filter((m) => task.assignee_ids?.includes(m.id));

  // Determine the primary color from the first active label to color-code the card edge
  const primaryAccentColor = cardLabels.length > 0 ? cardLabels[0].color : 'transparent';

  // Due Date Indicator Calculation System (buncha if elses)
  const getDueDateBadge = (dueDateString: string | undefined, taskStatus: string) => {
    if (!dueDateString) return null;
    
    // Make sure that it's updated when in the 'done' column
    if (taskStatus === 'done') {
      return { label: 'Completed', style: 'bg-zinc-800/40 text-zinc-500 border-zinc-800/80' };
    }

    const [year, month, day] = dueDateString.split('-').map(Number);
    const taskDate = new Date(year, month - 1, day);
    taskDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Past Due', style: 'bg-red-950/40 text-red-400 border-red-900/40 font-semibold' };
    } else if (diffDays === 0) {
      return { label: 'Due Today', style: 'bg-amber-950/50 text-amber-400 border-amber-900/40 font-semibold animate-pulse' };
    } else if (diffDays <= 2) {
      return { label: 'Approaching Due', style: 'bg-orange-950/30 text-orange-400 border-orange-900/30' };
    } else {
      return { label: 'On Track', style: 'bg-zinc-950 text-zinc-400 border-zinc-800/60' };
    }
  };

  const badgeInfo = getDueDateBadge(task.due_date, task.status);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onCardClick}
          style={{ 
            ...provided.draggableProps.style,
            borderLeftColor: primaryAccentColor,
            borderLeftWidth: cardLabels.length > 0 ? '4px' : '1px'
          }}
          className={`bg-zinc-900/80 border rounded-lg p-4 shadow-sm transition-all cursor-grab active:cursor-grabbing space-y-3 group relative border-zinc-800 hover:border-zinc-700 ${
            snapshot.isDragging ? 'border-indigo-500 bg-zinc-900 shadow-xl' : ''
          }`}
        >
          {/* Header Action Content */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-zinc-100 line-clamp-2 pr-4">{task.title}</h4>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}
              className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 p-1 rounded hover:bg-zinc-800/60 cursor-pointer"
              title="Delete task"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {task.description && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{task.description}</p>}

          {/* Action Row Badge Metadata Bundler */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>

              {/* Map through multiple color-coded tag pills seamlessly */}
              {cardLabels.map((lbl) => (
                <span 
                  key={lbl.id}
                  className="text-[10px] font-medium px-2 py-0.5 rounded border bg-zinc-950 text-zinc-300 shrink-0 flex items-center"
                  style={{ borderColor: `${lbl.color}33` }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: lbl.color }} />
                  {lbl.name}
                </span>
              ))}
            </div>

            {/* Urgency Track Indicators and Stacked Avatars Placement */}
            <div className="flex items-center justify-between gap-2 border-t border-zinc-800/40 pt-2 mt-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {task.due_date && (
                  <div className="flex items-center gap-1 text-zinc-500 text-[11px]">
                    <Calendar size={11} />
                    <span>
                      {(() => {
                        const [year, month, day] = task.due_date.split('-').map(Number);
                        return new Date(year, month - 1, day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      })()}
                    </span>
                  </div>
                )}

                {badgeInfo && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md border flex items-center gap-1 font-medium ${badgeInfo.style}`}>
                    <Clock size={9} />
                    {badgeInfo.label}
                  </span>
                )}
              </div>

              {/* Stacks multiple assigned team avatars with premium overlapping effect */}
              {cardAssignees.length > 0 && (
                <div className="flex items-center -space-x-1.5 overflow-hidden p-0.5 hover:space-x-0.5 transition-all duration-150">
                  {cardAssignees.map((member) => (
                    <Avatar key={member.id} name={member.name} color={member.color} size="sm" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
