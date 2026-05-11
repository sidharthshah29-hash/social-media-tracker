'use client';

import { Task, TaskPriority, TaskStatus } from '@/lib/types';

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'done'];

interface Props {
  task: Task;
  onClick: () => void;
  onStatusChange: (newStatus: TaskStatus) => void;
}

export default function TaskCard({ task, onClick, onStatusChange }: Props) {
  const isOverdue =
    task.due_date &&
    new Date(task.due_date + 'T23:59:59') < new Date() &&
    task.status !== 'done';

  const currentIndex = STATUS_ORDER.indexOf(task.status);
  const prevStatus = currentIndex > 0 ? STATUS_ORDER[currentIndex - 1] : null;
  const nextStatus = currentIndex < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIndex + 1] : null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all group"
      style={{ borderLeftWidth: 3, borderLeftColor: task.client_color || '#6366f1' }}
    >
      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
        {task.title}
      </p>
      {task.description && (
        <p className="mt-1 text-xs text-gray-400 line-clamp-2">{task.description}</p>
      )}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}
        >
          {task.priority}
        </span>
        <div className="flex items-center gap-1">
          {task.due_date && (
            <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
              {isOverdue ? '! ' : ''}
              {new Date(task.due_date + 'T12:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {prevStatus && (
              <button
                onClick={(e) => { e.stopPropagation(); onStatusChange(prevStatus); }}
                className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Move back"
              >
                ←
              </button>
            )}
            {nextStatus && (
              <button
                onClick={(e) => { e.stopPropagation(); onStatusChange(nextStatus); }}
                className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Move forward"
              >
                →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
