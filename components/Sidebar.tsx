'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Client } from '@/lib/types';

export default function Sidebar() {
  const pathname = usePathname();
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setClients(data))
      .catch(console.error);
  }, [pathname]);

  const navLink = (href: string, label: string, icon: React.ReactNode) => {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
          active ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
        }`}
      >
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <aside className="w-60 bg-gray-950 min-h-screen flex flex-col text-white flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
            SM
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold leading-tight truncate">Social Media Hub</h1>
            <p className="text-xs text-gray-500">Task Manager</p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="p-3 border-b border-gray-800 space-y-0.5">
        {navLink(
          '/',
          'Dashboard',
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )}
        {navLink(
          '/clients',
          'Clients',
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </nav>

      {/* Client boards list */}
      <div className="p-3 flex-1 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Boards
        </p>
        <div className="space-y-0.5">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/board/${client.id}`}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === `/board/${client.id}`
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: client.color }}
              />
              <span className="truncate">{client.name}</span>
            </Link>
          ))}
          {clients.length === 0 && (
            <p className="px-3 text-xs text-gray-600 italic">No clients yet</p>
          )}
        </div>
      </div>

      {/* Add client shortcut */}
      <div className="p-3 border-t border-gray-800">
        <Link
          href="/clients"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-gray-800/50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </Link>
      </div>
    </aside>
  );
}
