'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Client, Task } from '@/lib/types';

type Filter = 'total' | 'in_progress' | null;

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
};

const STATUS_COLORS: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
};

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Filter>(null);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((data) => {
        setClients(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalTasks = clients.reduce(
    (sum, c) =>
      sum +
      Number(c.todo_count || 0) +
      Number(c.in_progress_count || 0) +
      Number(c.done_count || 0),
    0
  );
  const totalActive = clients.reduce((sum, c) => sum + Number(c.in_progress_count || 0), 0);

  function handleStatClick(filter: Filter) {
    if (activeFilter === filter) {
      setActiveFilter(null);
      setFilteredTasks([]);
      return;
    }
    setActiveFilter(filter);
    setTasksLoading(true);
    const url = filter === 'in_progress' ? '/api/tasks?status=in_progress' : '/api/tasks';
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setFilteredTasks(Array.isArray(data) ? data : []);
        setTasksLoading(false);
      })
      .catch(() => setTasksLoading(false));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of all your client work</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl p-5 bg-blue-50">
          <p className="text-3xl font-bold text-blue-700">{clients.length}</p>
          <p className="text-sm mt-1 text-blue-700 opacity-75">Total Clients</p>
        </div>

        <button
          onClick={() => handleStatClick('in_progress')}
          className={`rounded-xl p-5 text-left transition-all ${
            activeFilter === 'in_progress'
              ? 'bg-amber-200 ring-2 ring-amber-400'
              : 'bg-amber-50 hover:bg-amber-100'
          }`}
        >
          <p className="text-3xl font-bold text-amber-700">{totalActive}</p>
          <p className="text-sm mt-1 text-amber-700 opacity-75">In Progress</p>
        </button>

        <button
          onClick={() => handleStatClick('total')}
          className={`rounded-xl p-5 text-left transition-all ${
            activeFilter === 'total'
              ? 'bg-gray-200 ring-2 ring-gray-400'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <p className="text-3xl font-bold text-gray-700">{totalTasks}</p>
          <p className="text-sm mt-1 text-gray-700 opacity-75">Total Tasks</p>
        </button>
      </div>

      {/* Filtered task panel */}
      {activeFilter && (
        <div className="mb-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-700 text-sm">
              {activeFilter === 'in_progress' ? 'In Progress Tasks' : 'All Tasks'}
            </h2>
            <button
              onClick={() => { setActiveFilter(null); setFilteredTasks([]); }}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕ Close
            </button>
          </div>

          {tasksLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading tasks…</div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No tasks found.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredTasks.map((task) => (
                <li key={task.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: task.client_color || '#ccc' }}
                  />
                  <span className="flex-1 text-sm text-gray-800 font-medium truncate">{task.title}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{task.client_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[task.status]}`}>
                    {STATUS_LABELS[task.status]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                  <Link
                    href={`/board/${task.client_id}`}
                    className="text-xs text-blue-500 hover:text-blue-700 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {clients.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No clients yet</h2>
          <p className="text-gray-400 mb-6 text-sm">Add your first client to start tracking tasks</p>
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Add your first client
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => {
            const total =
              Number(client.todo_count || 0) +
              Number(client.in_progress_count || 0) +
              Number(client.done_count || 0);
            const done = Number(client.done_count || 0);
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <Link key={client.id} href={`/board/${client.id}`}>
                <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer overflow-hidden group">
                  <div className="h-1.5" style={{ backgroundColor: client.color }} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ backgroundColor: client.color }}
                        >
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {client.name}
                        </h3>
                      </div>
                      <span className="text-xs text-gray-400">{total} tasks</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: 'To Do', count: client.todo_count || 0, cls: 'bg-gray-50 text-gray-600' },
                        { label: 'In Progress', count: client.in_progress_count || 0, cls: 'bg-blue-50 text-blue-600' },
                        { label: 'Done', count: client.done_count || 0, cls: 'bg-green-50 text-green-600' },
                      ].map(({ label, count, cls }) => (
                        <div key={label} className={`rounded-lg p-2.5 text-center ${cls}`}>
                          <p className="text-xl font-bold leading-tight">{count}</p>
                          <p className="text-xs leading-tight mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>

                    {total > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Completion</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
