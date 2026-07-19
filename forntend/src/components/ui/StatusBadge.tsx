import clsx from 'clsx';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import type { DocumentStatus } from '../../lib/types';

const CONFIG: Record<
  DocumentStatus,
  { label: string; className: string; icon: typeof Clock; spin?: boolean }
> = {
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-300 border-amber-500/30', icon: Clock },
  processing: {
    label: 'Processing',
    className: 'bg-brand-500/10 text-brand-300 border-brand-500/30',
    icon: Loader2,
    spin: true,
  },
  ready: {
    label: 'Ready',
    className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    icon: CheckCircle2,
  },
  failed: { label: 'Failed', className: 'bg-rose-500/10 text-rose-300 border-rose-500/30', icon: XCircle },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const cfg = CONFIG[status] ?? CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        cfg.className,
      )}
    >
      <Icon className={clsx('h-3 w-3', cfg.spin && 'animate-spin')} />
      {cfg.label}
    </span>
  );
}
