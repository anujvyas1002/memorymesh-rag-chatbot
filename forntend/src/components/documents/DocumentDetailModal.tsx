import { AlertTriangle } from 'lucide-react';
import { useDocument } from '../../hooks/useDocuments';
import { formatDateTime } from '../../lib/format';
import { ErrorState } from '../ui/States';
import { LoadingBlock } from '../ui/Spinner';
import { Modal } from '../ui/Modal';
import { StatusBadge } from '../ui/StatusBadge';

export function DocumentDetailModal({
  id,
  open,
  onClose,
}: {
  id: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading, isError, error, refetch } = useDocument(open ? (id ?? undefined) : undefined);

  return (
    <Modal open={open} onClose={onClose} title="Document details" maxWidth="max-w-2xl">
      {isLoading ? (
        <LoadingBlock />
      ) : isError ? (
        <ErrorState message={error instanceof Error ? error.message : 'Failed to load'} onRetry={refetch} />
      ) : data ? (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-100">{data.title}</h3>
            <StatusBadge status={data.status} />
          </div>

          {data.status === 'failed' && data.error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{data.error}</span>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Field label="Chunks" value={String(data.chunkCount)} />
            <Field label="Source" value={data.source ?? '—'} />
            <Field label="Created" value={formatDateTime(data.createdAt)} />
            <Field label="Updated" value={formatDateTime(data.updatedAt)} />
            <Field label="ID" value={data.id} mono />
          </dl>

          <div>
            <p className="label">Metadata</p>
            <pre className="max-h-64 overflow-auto rounded-lg border border-slate-800 bg-slate-950/60 p-3 font-mono text-xs text-slate-300">
              {data.metadata ? JSON.stringify(data.metadata, null, 2) : 'null'}
            </pre>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="label">{label}</dt>
      <dd className={`truncate text-slate-200 ${mono ? 'font-mono text-xs' : ''}`} title={value}>
        {value}
      </dd>
    </div>
  );
}
