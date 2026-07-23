import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, History, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Avatar } from './Avatar';
import type { Task, TeamMember, TaskComment, TaskActivityLog } from '../types';

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
  teamMembers: TeamMember[];
}

// Unified layout wrapper for sorting chronological events
type TimelineEvent = 
  | { type: 'comment'; data: TaskComment; timestamp: string }
  | { type: 'activity'; data: TaskActivityLog; timestamp: string };

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({ task, onClose, teamMembers }) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!task) return;

    // Initial baseline fetch of existing comments and logs
    async function fetchInitialTimelineData() {
        setLoading(true);
        
        const [commentsRes, logsRes] = await Promise.all([
        supabase.from('task_comments').select('*').eq('task_id', task!.id),
        supabase.from('task_activity_logs').select('*').eq('task_id', task!.id)
        ]);

        if (!commentsRes.error && !logsRes.error) {
        const commentsEvents: TimelineEvent[] = (commentsRes.data as TaskComment[]).map(c => ({
            type: 'comment', data: c, timestamp: c.created_at
        }));
        
        const logsEvents: TimelineEvent[] = (logsRes.data as TaskActivityLog[]).map(l => ({
            type: 'activity', data: l, timestamp: l.created_at
        }));

        const sortedTimeline = [...commentsEvents, ...logsEvents].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        setTimeline(sortedTimeline);
        }
        setLoading(false);
    }

    fetchInitialTimelineData();

    // Real-time Subscription Channel Setup
    const timelineChannel = supabase
        .channel(`task-timeline-${task.id}`)
        
        // Listen for new comments
        .on(
        'postgres_changes',
        {
            event: 'INSERT',
            schema: 'public',
            table: 'task_comments',
            filter: `task_id=eq.${task.id}` // Only stream messages belonging to this task card
        },
        (payload) => {
            const newCommentItem = payload.new as TaskComment;
            setTimeline((current) => {
            // Guard clause to ensure we don't accidentally display double duplicates
              if (current.some(e => e.type === 'comment' && e.data.id === newCommentItem.id)) return current;
              return [...current, { type: 'comment', data: newCommentItem, timestamp: newCommentItem.created_at }];
            });
        }
        )
        
        // Listen for new activity logs (like column drags)
        .on(
        'postgres_changes',
        {
            event: 'INSERT',
            schema: 'public',
            table: 'task_activity_logs',
            filter: `task_id=eq.${task.id}` // Only stream updates belonging to this task card
        },
        (payload) => {
            const newLogItem = payload.new as TaskActivityLog;
            setTimeline((current) => {
            if (current.some(e => e.type === 'activity' && e.data.id === newLogItem.id)) return current;
            return [...current, { type: 'activity', data: newLogItem, timestamp: newLogItem.created_at }];
            });
        }
        )
        .subscribe();

    // Clean up subscription connection on panel close
    return () => {
        supabase.removeChannel(timelineChannel);
    };
    }, [task]);

  if (!task) return null;

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const payload = {
        task_id: task.id,
        content: newComment.trim(),
        member_id: selectedMemberId || null,
    };

    setNewComment(''); // Clear input text immediately for smooth UX

    const { error } = await supabase
        .from('task_comments')
        .insert([payload]);

    if (error) {
        console.error('Failed to post comment:', error.message);
    }
  };


  // Helper formatting engine to translate snake_case statuses to human string layouts
  const formatStatus = (statusStr: string | null) => {
    if (!statusStr) return '';
    return statusStr.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-96 bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col animate-slide-in">
      {/* Panel Header */}
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
          <MessageSquare size={14} />
          <span>Issue Activity Feed</span>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-800 transition-all cursor-pointer">
          <X size={16} />
        </button>
      </div>

      {/* Main Track View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <div>
          <h3 className="text-base font-semibold text-zinc-100">{task.title}</h3>
          <p className="text-xs text-zinc-400 mt-2 whitespace-pre-wrap leading-relaxed">
            {task.description || <span className="italic text-zinc-600">No description provided.</span>}
          </p>
        </div>

        {/* Combined Timeline Stack */}
        <div className="space-y-4 border-t border-zinc-800/60 pt-4">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <History size={12} /> Timeline History
          </h4>
          
          {loading ? (
            <p className="text-xs text-zinc-600 animate-pulse">Loading workspace changes...</p>
          ) : timeline.length === 0 ? (
            <p className="text-xs text-zinc-600 italic">No historical events logged yet.</p>
          ) : (
            <div className="relative pl-4 space-y-4 border-l border-zinc-800 ml-2">
              {timeline.map((event) => {
                const isComment = event.type === 'comment';
                const timeString = new Date(event.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                
                if (isComment) {
                  // Render a Comment Block
                  const commentData = event.data as TaskComment;
                  const commentator = teamMembers.find((m) => m.id === commentData.member_id);
                  return (
                    <div key={`c-${commentData.id}`} className="relative bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-3 space-y-2">
                      <div className="absolute -left-[21px] top-4 bg-zinc-900 h-2 w-2 rounded-full border border-zinc-700" />
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <Avatar name={commentator ? commentator.name : 'Guest User'} color={commentator ? commentator.color : '#52525b'} size="sm" />
                          <span className="font-medium text-zinc-300">{commentator ? commentator.name : 'Guest User'}</span>
                        </div>
                        <span className="text-zinc-600">{timeString}</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed pl-7">{commentData.content}</p>
                    </div>
                  );
                } else {
                  // Render an Activity Log Entry
                  const logData = event.data as TaskActivityLog;
                  return (
                    <div key={`l-${logData.id}`} className="relative flex items-center justify-between text-xs text-zinc-500 py-0.5">
                      <div className="absolute -left-[21px] bg-zinc-950 h-2 w-2 rounded-full border border-indigo-500" />
                      
                      <div className="flex items-center gap-1.5 flex-wrap max-w-[260px]">
                        {logData.action_type === 'create' ? (
                          <span className="text-zinc-400 italic">Task created successfully</span>
                        ) : logData.action_type === 'status_change' ? (
                          <div className="flex items-center gap-1 flex-wrap text-[11px]">
                            <span className="text-zinc-400">Moved:</span>
                            <span className="bg-zinc-950 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded text-[10px] font-mono">{formatStatus(logData.old_value)}</span>
                            <ArrowRight size={10} className="text-zinc-600 shrink-0" />
                            <span className="bg-indigo-950/40 text-indigo-400 border border-indigo-900/40 px-1.5 py-0.5 rounded text-[10px] font-mono">{formatStatus(logData.new_value)}</span>
                          </div>
                        ) : null}
                      </div>
                      <span className="text-[10px] text-zinc-600 shrink-0 font-mono">{timeString}</span>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>

      {/* Input Form Footer */}
      <form onSubmit={handleSendComment} className="p-4 border-t border-zinc-800 bg-zinc-950/40 space-y-2 shrink-0">
        <select
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          className="bg-transparent text-[11px] text-zinc-500 border border-zinc-800 rounded px-1.5 py-0.5 outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="">Comment as Guest</option>
          {teamMembers.map((m) => <option key={m.id} value={m.id}>As {m.name}</option>)}
        </select>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-2 focus-within:border-indigo-500 transition-colors">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-transparent text-xs text-zinc-200 outline-none placeholder-zinc-600"
          />
          <button type="submit" className="text-zinc-500 hover:text-indigo-400 p-1 transition-colors cursor-pointer"><Send size={14} /></button>
        </div>
      </form>
    </div>
  );
};
