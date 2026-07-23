import { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { BoardColumn } from './components/BoardColumn';
import { CreateTaskModal } from './components/CreateTaskModal';
import { supabase } from './supabaseClient';
import { useAuth } from './hooks/useAuth';
import { COLUMNS } from './types';
import { TaskDetailPanel } from './components/TaskDetailPane';
import type { Task, TaskStatus, TeamMember, Label, TaskPriority } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';


export default function App() {
  const { userId, loading: authLoading } = useAuth(); // Boots guest auth session tracking and blocks loading states

  // Holds rows downloaded from Supabase to feed into the UI layers
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]); // New Team Cache State
  const [labels, setLabels] = useState<Label[]>([]);

  // Manages panel sizing, overlays, and drawer selections
  const [dbLoading, setDbLoading] = useState(true);
  const [activeCreationStatus, setActiveCreationStatus] = useState<TaskStatus | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Holds active choices for the top filter bar dashboard
  const [selectedFilterLabelId, setSelectedFilterLabelId] = useState<string | null>(null);
  const [selectedFilterMemberId, setSelectedFilterMemberId] = useState<string | null>(null);
  const [selectedFilterPriority, setSelectedFilterPriority] = useState<TaskPriority | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Unified Parallel database fetching engine
  useEffect(() => {
    if (authLoading || !userId) return;
    
    async function initializeWorkspaceData() {
      // Relational select loads mapped array tables in one network packet trip
      const [tasksResponse, teamResponse, labelsResponse] = await Promise.all([
        supabase.from('tasks').select('*, task_assignees(member_id), task_labels(label_id)').order('created_at', { ascending: true }),
        supabase.from('team_members').select('*').order('created_at', { ascending: true }),
        supabase.from('labels').select('*').order('name', { ascending: true })
      ]);
      
      if (!tasksResponse.error && tasksResponse.data) {
        // Re-maps PostgreSQL sub-array objects into flat string list arrays
        const formattedTasks = tasksResponse.data.map((t: any) => ({
          ...t,
          assignee_ids: t.task_assignees?.map((a: any) => a.member_id) || [],
          label_ids: t.task_labels?.map((l: any) => l.label_id) || []
        }));
        setTasks(formattedTasks as Task[]);
      }

      // Seed remaining metadata collections into state memory
      if (!teamResponse.error && teamResponse.data) setTeamMembers(teamResponse.data as TeamMember[]);
      if (!labelsResponse.error && labelsResponse.data) setLabels(labelsResponse.data as Label[]);
      
      setDbLoading(false);  // Drops loading shield, displaying board UI
    }
    
    initializeWorkspaceData();
  }, [authLoading, userId]);

  // Calculations of Filters
  const filteredTasks = tasks.filter((task) => {
    const matchesLabel = selectedFilterLabelId ? task.label_ids?.includes(selectedFilterLabelId) : true;
    const matchesMember = selectedFilterMemberId ? task.assignee_ids?.includes(selectedFilterMemberId) : true;
    const matchesPriority = selectedFilterPriority ? task.priority === selectedFilterPriority : true;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLabel && matchesMember && matchesPriority && matchesSearch;
  });

  // Handling adding to the current state memory
  const handleTaskCreated = (newTask: Task) => {
    setTasks((current) => [...current, newTask]);
  };

  const handleMemberAdded = (newMember: TeamMember) => {
    setTeamMembers((current) => [...current, newMember]);
  };

  const handleLabelAdded = (newLabel: Label) => {
    setLabels((current) => [...current, newLabel]);
  };

  // Spinner while loading
  if (authLoading || dbLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          <p className="text-xs text-zinc-400 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // For Dragging and dropping tasks
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const previousTasks = [...tasks];
    const updatedStatus = destination.droppableId as TaskStatus;
    const previousStatus = tasks.find(t => t.id === draggableId)?.status || 'unknown';

    setTasks((currentTasks) => currentTasks.map((task) => task.id === draggableId ? { ...task, status: updatedStatus } : task ));

    const { error } = await supabase
      .from('tasks')
      .update({ status: updatedStatus })
      .eq('id', draggableId);

    if (error) {
      setTasks(previousTasks);
    } else {
      // Insert the status change log on database update success
      await supabase
        .from('task_activity_logs')
        .insert([{
          task_id: draggableId,
          action_type: 'status_change',
          old_value: previousStatus,
          new_value: updatedStatus
        }]);
    }
  };

  // Deletion with trash icon on corner of task
  const handleTaskDelete = async () => {
    if (!taskToDelete) return;
    const targetId = taskToDelete.id;
    setTasks((current) => current.filter((t) => t.id !== targetId));
    setTaskToDelete(null);
    await supabase.from('tasks').delete().eq('id', targetId);
  };


  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-50">
      
      {/* Left Sidebar Navigation & Summary Panel */}
      <Sidebar 
        isSidebarExpanded={isSidebarExpanded}
        setIsSidebarExpanded={setIsSidebarExpanded}
        tasks={tasks}
        teamMembers={teamMembers}
        onMemberAdded={handleMemberAdded}
      />

      {/* Workspace Dashboard Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        
        {/*  Primary Layout Header Toolbar Actions */}
        <Header 
          isSidebarExpanded={isSidebarExpanded}
          setIsSidebarExpanded={setIsSidebarExpanded}
          onLabelAdded={handleLabelAdded}
          setActiveCreationStatus={setActiveCreationStatus}
        />

        {/* Sub-Header Query Search & Filtering Badges */}
        <FilterBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilterLabelId={selectedFilterLabelId}
          setSelectedFilterLabelId={setSelectedFilterLabelId}
          selectedFilterMemberId={selectedFilterMemberId}
          setSelectedFilterMemberId={setSelectedFilterMemberId}
          selectedFilterPriority={selectedFilterPriority} // Injected
          setSelectedFilterPriority={setSelectedFilterPriority} // Injected
          labels={labels}
          members={teamMembers} 
        />

        {/* Core Columns Drag-and-Drop Canvas Track */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-x-auto p-8 flex gap-4 items-start select-none">
            {COLUMNS.map((col) => (
              <BoardColumn key={col.id} column={col} tasks={filteredTasks.filter((t) => t.status === col.id)} labels={labels} teamMembers={teamMembers} onAddTaskClick={() => setActiveCreationStatus(col.id)} onDeleteTaskClick={(task) => setTaskToDelete(task)} onTaskSelect={(task) => setSelectedTask(task)} />
            ))}
          </div>
        </DragDropContext>

      </main>

      {/* Global Form Sheets & Modal Overlays */}
      <CreateTaskModal isOpen={activeCreationStatus !== null} defaultStatus={activeCreationStatus || 'todo'} onClose={() => setActiveCreationStatus(null)} onTaskCreated={handleTaskCreated} teamMembers={teamMembers} labels={labels} />

      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">Delete task?</h3>
              <p className="text-xs text-zinc-400 mt-1">Are you sure you want to delete <span className="text-zinc-300 font-medium">"{taskToDelete.title}"</span>?</p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/60">
              <button onClick={() => setTaskToDelete(null)} className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 text-xs hover:bg-zinc-900 cursor-pointer transition-all">Cancel</button>
              <button onClick={handleTaskDelete} className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-medium text-xs cursor-pointer hover:bg-red-500 transition-all">Delete permanently</button>
            </div>
          </div>
        </div>
      )}

      <TaskDetailPanel task={selectedTask} teamMembers={teamMembers} onClose={() => setSelectedTask(null)} />

    </div>
  );
}
