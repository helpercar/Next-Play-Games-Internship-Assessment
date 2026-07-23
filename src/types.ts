// Defines strict TypeScript types and interfaces that match the Supabase database schema

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'; // Strict status type union limiting column tracks to four specific states
export type TaskPriority = 'low' | 'normal' | 'high'; // Strict priority type union enforcing uniformity on card urgency badges

// Defines the properties of an individual task card record.
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  user_id: string;
  created_at: string;
  
  // Multi-item array trackers
  assignee_ids?: string[]; // Array of mapped teammate IDs
  label_ids?: string[];    // Array of mapped label IDs
}

// Defines the profile schema for created teammates.
export interface TeamMember {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

// Defines an isolated task card discussion comment row.
export interface TaskComment {
  id: string;
  task_id: string;  // Foreign Key link pointing directly to the parent Task
  member_id: string | null; // Tracks which profile commented
  content: string;
  user_id: string;
  created_at: string;
}

// Layout blueprint configuration metadata structure for Columns
export interface Column {
    id: TaskStatus;
    title: string;
}

// Global immutable constant array used by App.tsx to map out the 4 board columns
export const COLUMNS: Column[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'in_review', title: 'In Review' },
    { id: 'done', title: 'Done' },
];

// Schema blueprint tracking historical progress for issue audit feeds
export interface TaskActivityLog {
  id: string;
  task_id: string;
  member_id: string | null;
  action_type: 'status_change' | 'create' | 'priority_change' | 'assignee_change';
  old_value: string | null;
  new_value: string | null;
  user_id: string;
  created_at: string;
}

// Schema tracking custom tags and card left-accent border color definitions.
export interface Label {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}