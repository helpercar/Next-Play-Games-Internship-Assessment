import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { Task, TaskPriority, TaskStatus, TeamMember, Label } from '../types';

// Component props interface managing rendering visibility, default status positioning, and workspace sync caches
interface CreateTaskModalProps {
  isOpen: boolean;
  defaultStatus: TaskStatus;
  onClose: () => void;
  onTaskCreated: (newTask: Task) => void;
  teamMembers: TeamMember[];
  labels: Label[];
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ 
  isOpen, 
  defaultStatus, 
  onClose, 
  onTaskCreated,
  teamMembers,
  labels
}) => {
  // Local state managers capturing form inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Array states capturing checked items for our many-to-many relationship structures
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

  // Early layout exit guard clause ensuring modal stays invisible when closed
  if (!isOpen) return null;

  // Toggle helpers to seamlessly append or slice selected items from checkbox tracking states
  const toggleAssignee = (id: string) => {
    setSelectedAssigneeIds((prev) => 
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleLabel = (id: string) => {
    setSelectedLabelIds((prev) => 
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Central submission function processing relational batch inserts
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);

    // Insert root task data first to capture its generated primary key ID
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .insert([{ 
        title: title.trim(), 
        description: description.trim() || null, 
        priority, 
        status: defaultStatus, 
        due_date: dueDate || null 
      }])
      .select()
      .single();

    if (taskError) {
      alert(`Error creating task: ${taskError.message}`);
      setSubmitting(false);
      return;
    }

    if (taskData) {
      // Map tracking arrays into relational junction table payloads
      const assigneePayloads = selectedAssigneeIds.map((id) => ({
        task_id: taskData.id,
        member_id: id
      }));

      const labelPayloads = selectedLabelIds.map((id) => ({
        task_id: taskData.id,
        label_id: id
      }));

      try {
        //  Execute junction maps simultaneously to save database round-trips
        await Promise.all([
          assigneePayloads.length ? supabase.from('task_assignees').insert(assigneePayloads) : Promise.resolve(),
          labelPayloads.length ? supabase.from('task_labels').insert(labelPayloads) : Promise.resolve()
        ]);

        // Automatically log creation event inside activity timeline history
        await supabase.from('task_activity_logs').insert([{
          task_id: taskData.id,
          action_type: 'create',
          new_value: 'Task initialized with multi-item dependencies'
        }]);

        // Lift data payload upward into parent board state mapping arrays
        onTaskCreated({
          ...taskData,
          assignee_ids: selectedAssigneeIds,
          label_ids: selectedLabelIds
        });

        // Purge input parameters to leave a clean canvas for next open cycle
        setTitle('');
        setDescription('');
        setPriority('normal');
        setDueDate('');
        setSelectedAssigneeIds([]);
        setSelectedLabelIds([]);
        onClose();
      } catch (err: any) {
        console.error("Relational mapping failed:", err.message);
        alert("Task created, but linking assignees or labels encountered a database synchronization issue.");
      }
    }
    
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 relative flex flex-col gap-4">
        
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-200">Create new issue</h3>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="Issue title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              className="w-full bg-transparent text-zinc-100 text-sm font-medium border-b border-zinc-800 focus:border-indigo-500 outline-none pb-2 placeholder-zinc-600" 
            />
          </div>

          <div>
            <textarea 
              placeholder="Add description..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3} 
              className="w-full bg-transparent text-zinc-300 text-xs border border-zinc-800 focus:border-indigo-500 outline-none p-2 rounded-lg resize-none placeholder-zinc-600" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Priority</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value as TaskPriority)} 
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg p-2 outline-none focus:border-indigo-500 cursor-pointer" 
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Due Date</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg p-2 outline-none focus:border-indigo-500 text-zinc-100 cursor-pointer" 
              />
            </div>
          </div>

          {/* Interactive Checkbox Grid Multi-Selectors Track List */}
          <div className="grid grid-cols-2 gap-4 border-t border-zinc-800/60 pt-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5">Assignees</label>
              <div className="space-y-1.5 max-h-28 overflow-y-auto custom-scrollbar bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                {teamMembers.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none group/item">
                    <input 
                      type="checkbox" 
                      checked={selectedAssigneeIds.includes(m.id)} 
                      onChange={() => toggleAssignee(m.id)} 
                      className="rounded border-zinc-800 bg-zinc-900 text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-indigo-600" 
                    />
                    <span className="group-hover/item:text-zinc-100 transition-colors">{m.name}</span>
                  </label>
                ))}
                {teamMembers.length === 0 && <span className="text-[10px] text-zinc-600 italic">No team profiles added yet.</span>}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5">Labels / Tags</label>
              <div className="space-y-1.5 max-h-28 overflow-y-auto custom-scrollbar bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                {labels.map((l) => (
                  <label key={l.id} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none group/item">
                    <input 
                      type="checkbox" 
                      checked={selectedLabelIds.includes(l.id)} 
                      onChange={() => toggleLabel(l.id)} 
                      className="rounded border-zinc-800 bg-zinc-900 text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-indigo-600" 
                    />
                    <span className="flex items-center gap-1.5 group-hover/item:text-zinc-100 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                      {l.name}
                    </span>
                  </label>
                ))}
                {labels.length === 0 && <span className="text-[10px] text-zinc-600 italic">No labels created yet.</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/60">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs hover:bg-zinc-900 transition-all cursor-pointer" 
            > 
              Cancel 
            </button>
            <button 
              type="submit" 
              disabled={submitting} 
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-sm transition-all cursor-pointer" 
            > 
              {submitting ? 'Creating...' : 'Create issue'} 
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
