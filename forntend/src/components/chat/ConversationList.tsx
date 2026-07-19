import clsx from 'clsx';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { formatRelative } from '../../lib/format';
import type { ConversationResponse } from '../../lib/types';
import { LoadingBlock } from '../ui/Spinner';

export function ConversationList({
  conversations,
  activeId,
  isLoading,
  onSelect,
  onNew,
  onDelete,
}: {
  conversations: ConversationResponse[];
  activeId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-r border-slate-800">
      <div className="p-3">
        <button onClick={onNew} className="btn-primary w-full">
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <LoadingBlock label="Loading chats…" />
        ) : conversations.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-slate-500">No conversations yet.</p>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <div
                  className={clsx(
                    'group flex items-center gap-2 rounded-lg px-3 py-2 transition',
                    conv.id === activeId
                      ? 'bg-brand-600/15 text-brand-100'
                      : 'text-slate-300 hover:bg-slate-800/60',
                  )}
                >
                  <button
                    onClick={() => onSelect(conv.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-slate-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{conv.title ?? 'Untitled chat'}</p>
                      <p className="text-[11px] text-slate-500">{formatRelative(conv.updatedAt)}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => onDelete(conv.id)}
                    className="shrink-0 rounded p-1 text-slate-500 opacity-0 transition hover:text-rose-400 group-hover:opacity-100"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
