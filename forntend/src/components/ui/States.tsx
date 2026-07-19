import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="rounded-full bg-slate-800/80 p-3 text-slate-400">{icon ?? <Inbox className="h-6 w-6" />}</div>
      <div>
        <p className="font-medium text-slate-200">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="rounded-full bg-rose-500/10 p-3 text-rose-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="max-w-md text-sm text-slate-300">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      )}
    </div>
  );
}
