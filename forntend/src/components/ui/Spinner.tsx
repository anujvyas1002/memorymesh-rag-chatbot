import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={clsx('h-4 w-4 animate-spin', className)} />;
}

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}
