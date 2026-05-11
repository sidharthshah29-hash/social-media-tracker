export interface Client {
  id: number;
  name: string;
  color: string;
  is_potential: boolean;
  created_at: string;
  todo_count?: number;
  in_progress_count?: number;
  done_count?: number;
}

export interface Task {
  id: number;
  client_id: number;
  client_name?: string;
  client_color?: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];

export const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#06b6d4', '#84cc16', '#f43f5e', '#a855f7',
];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};
