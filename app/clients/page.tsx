'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Client, COLORS } from '@/lib/types';

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  const fetchClients = () => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((data) => {
        setClients(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchClients();
  }, []);

  function openAdd() {
    setEditing(null);
    setName('');
    setColor(COLORS[clients.length % COLORS.length]);
    setShowForm(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setName(client.name);
    setColor(client.color);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setName('');
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const url = editing ? `/api/clients/${editing.id}` : '/api/clients';
      const method = editing ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), color }),
      });
      closeForm();
      fetchClients();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(client: Client) {
    const total =
      Number(client.todo_count || 0) +
      Number(client.in_progress_count || 0) +
      Number(client.done_count || 0);
    const msg =
      total > 0
        ? `Delete "${client.name}"? This will also delete ${total} task${total === 1 ? '' : 's'}.`
        : `Delete "${client.name}"?`;
    if (!confirm(msg)) return;
    await fetch(`/api/clients/${client.id}`, { method: 'DELETE' });
    fetchClients();
    router.refresh();
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">
            {clients.length} client{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse text-gray-400">Loading...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No clients yet</h2>
          <button
            onClick={openAdd}
            className="mt-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Add your first client
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {clients.map((client) => {
            const total =
              Number(client.todo_count || 0) +
              Number(client.in_progress_count || 0) +
              Number(client.done_count || 0);
            return (
              <div
                key={client.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-4 h-10 rounded-md flex-shrink-0"
                  style={{ backgroundColor: client.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-400">
                    {total} task{total !== 1 ? 's' : ''} &middot; {client.todo_count || 0} to do
                    &middot; {client.in_progress_count || 0} in progress
                    &middot; {client.done_count || 0} done
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(client)}
                    className="text-sm text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(client)}
                    className="text-sm text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Client form modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              {editing ? 'Edit Client' : 'New Client'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client name <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') closeForm();
                  }}
                  placeholder="e.g. Acme Corp"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
                      style={{
                        backgroundColor: c,
                        outline: color === c ? `3px solid ${c}` : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6 justify-end">
              <button
                onClick={closeForm}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || saving}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                {saving ? 'Saving...' : editing ? 'Save changes' : 'Add client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
