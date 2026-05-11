'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Client, Task, TaskStatus } from '@/lib/types';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';

const COLUMNS: { status: TaskStatus; label: string; accent: string }[] = [
  { status: 'todo', label: 'To Do', accent: 'border-gray-300' },
  { status: 'in_progress', label: 'In Progress', accent: 'border-blue-400' },
  { status: 'done', label: 'Done', accent: 'border-green-400' },
];

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [modal, setModal] = useState<{
    open: boolean;
    task: Task | null;
    defaultStatus: TaskStatus;
  }>({ open: false, task: null, defaultStatus: 'todo' });

  const fetchData = async () => {
    try {
      const [clientRes, tasksRes] = await Promise.all([
        fetch(`/api/clients/${id}`),
        fetch(`/api/tasks?client_id=${id}`),
      ]);
      if (!clientRes.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const [clientData, tasksData] = await Promise.all([
        clientRes.json(),
        tasksRes.json(),
      ]);
      setClient(clientData);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        due_date: task.due_date,
      }),
    });
  };

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    for (const task of tasks) {
      if (task.status in map) map[task.status].push(task);
    }
    return map;
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-400">Loading board...</div>
      </div>
    );
  }

  if (notFound || !client) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <p className="text-gray-500">Client not found</p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Board header */}
      <div className="flex items-center gap-3 px-4 md:px-8 py-3 md:py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: client.color }}
          >
            {client.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-xl font-bold text-gray-900 truncate">{client.name}</h1>
        </div>
        <span className="text-sm text-gray-400 flex-shrink-0">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-3 md:p-6 h-full" style={{ minWidth: 'max-content' }}>
          {COLUMNS.map(({ status, label, accent }) => {
            const columnTasks = tasksByStatus[status];
            return (
              <div key={status} className="w-64 md:w-72 flex flex-col bg-gray-50 rounded-xl">
                {/* Column header */}
                <div className={`flex items-center justify-between px-4 py-3 border-b-2 ${accent}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700 text-sm">{label}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 font-medium">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setModal({ open: true, task: null, defaultStatus: status })}
                    className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 w-6 h-6 rounded flex items-center justify-center transition-colors"
                    title={`Add task to ${label}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Task list */}
                <div className="flex-1 overflow-y-auto p-3 pb-20 md:pb-3 space-y-2">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={{ ...task, client_color: client.color }}
                      onClick={() =>
                        setModal({ open: true, task, defaultStatus: task.status })
                      }
                      onStatusChange={(newStatus) => handleStatusChange(task, newStatus)}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <button
                      onClick={() => setModal({ open: true, task: null, defaultStatus: status })}
                      className="w-full py-8 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-500 transition-colors"
                    >
                      + Add a task
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task modal */}
      {modal.open && (
        <TaskModal
          task={modal.task}
          clientId={client.id}
          defaultStatus={modal.defaultStatus}
          onSave={fetchData}
          onClose={() => setModal({ open: false, task: null, defaultStatus: 'todo' })}
        />
      )}
    </div>
  );
}
