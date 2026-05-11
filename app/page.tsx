'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Client } from '@/lib/types';

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

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
        {[
          { label: 'Total Clients', value: clients.length, bg: 'bg-blue-50', text: 'text-blue-700' },
          { label: 'In Progress', value: totalActive, bg: 'bg-amber-50', text: 'text-amber-700' },
          { label: 'Total Tasks', value: totalTasks, bg: 'bg-gray-100', text: 'text-gray-700' },
        ].map(({ label, value, bg, text }) => (
          <div key={label} className={`rounded-xl p-5 ${bg}`}>
            <p className={`text-3xl font-bold ${text}`}>{value}</p>
            <p className={`text-sm mt-1 ${text} opacity-75`}>{label}</p>
          </div>
        ))}
      </div>

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
