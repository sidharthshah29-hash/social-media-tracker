'use client';

import { useEffect, useState } from 'react';
import {
  Task,
  TaskPriority,
  TaskStatus,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from '@/lib/types';

interface Props {
  task?: Task | null;
  clientId: number;
  defaultStatus?: TaskStatus;
  onSave: () => void;
  onClose: () => void;
}

export default function TaskModal({
  task,
  clientId,
  defaultStatus = 'todo',
  onSave,
  onClose,
}: Props) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const url = task ? `/api/tasks/${task.id}` : '/api/tasks';
      const method = task ? 'PUT' : 'POST';
      const body: Record<string, unknown> = {
        title,
        description: description || null,
        status,
        priority,
        due_date: dueDate || null,
      };
      if (!task) body.client_id = clientId;
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      onSave();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!task || !confirm('Delete this task?')) return;
    setDeleting(true);
    try {
      await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
      onSave();
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) handleSave();
              }}
              placeholder="What needs to be done?"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            {task && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete task'}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              {saving ? 'Saving...' : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
