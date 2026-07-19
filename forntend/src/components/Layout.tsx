import clsx from 'clsx';
import { FileText, KeyRound, MessageSquare, Search } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useApiKey } from '../context/ApiKeyContext';
import { ApiKeyDialog } from './ApiKeyDialog';
import { HealthBadge } from './HealthBadge';

const NAV = [
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/search', label: 'Search', icon: Search },
];

export function Layout() {
  const { hasApiKey } = useApiKey();
  const [keyOpen, setKeyOpen] = useState(false);

  return (
    <div className="flex h-full">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white shadow-lg shadow-brand-600/20">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-100">RAG Console</p>
            <p className="text-[11px] text-slate-500">Retrieval-Augmented Gen</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-600/15 text-brand-200'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 border-t border-slate-800 px-3 py-4">
          <div className="px-1">
            <HealthBadge />
          </div>
          <button
            onClick={() => setKeyOpen(true)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-slate-100"
          >
            <KeyRound className="h-4 w-4" />
            API key
            <span
              className={clsx(
                'ml-auto h-2 w-2 rounded-full',
                hasApiKey ? 'bg-emerald-400' : 'bg-slate-600',
              )}
              title={hasApiKey ? 'Key set' : 'No key set'}
            />
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      <ApiKeyDialog open={keyOpen} onClose={() => setKeyOpen(false)} />
    </div>
  );
}
