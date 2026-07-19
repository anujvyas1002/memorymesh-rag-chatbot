import { FileText, Plus, RefreshCw, RotateCw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AddDocumentModal } from '../components/documents/AddDocumentModal';
import { DocumentDetailModal } from '../components/documents/DocumentDetailModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PageHeader } from '../components/ui/PageHeader';
import { Pagination } from '../components/ui/Pagination';
import { LoadingBlock, Spinner } from '../components/ui/Spinner';
import { EmptyState, ErrorState } from '../components/ui/States';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../context/ToastContext';
import { useDeleteDocument, useDocuments, useReprocessDocument } from '../hooks/useDocuments';
import { ApiError } from '../lib/api';
import { formatRelative } from '../lib/format';
import type { DocumentResponse } from '../lib/types';

const PAGE_SIZE = 20;

export function DocumentsPage() {
  const { success, error: toastError } = useToast();
  const qc = useQueryClient();
  const [skip, setSkip] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<DocumentResponse | null>(null);

  const params = useMemo(() => ({ skip, take: PAGE_SIZE }), [skip]);
  const { data, isLoading, isError, error, refetch, isFetching } = useDocuments(params);
  const reprocess = useReprocessDocument();
  const remove = useDeleteDocument();

  const docs = data?.items ?? [];

  const onReprocess = async (doc: DocumentResponse) => {
    try {
      await reprocess.mutateAsync(doc.id);
      success(`Reprocessing “${doc.title}”`);
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to reprocess');
    }
  };

  const onDelete = async () => {
    if (!deleteDoc) {
      return;
    }
    try {
      await remove.mutateAsync(deleteDoc.id);
      success(`Deleted “${deleteDoc.title}”`);
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to delete');
    } finally {
      setDeleteDoc(null);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Documents"
        description="Ingested sources that power retrieval. Chunked and embedded for vector search."
        actions={
          <>
            <button
              className="btn-secondary"
              onClick={() => qc.invalidateQueries({ queryKey: ['documents'] })}
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="btn-primary" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add document
            </button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <LoadingBlock label="Loading documents…" />
        ) : isError ? (
          <ErrorState
            message={error instanceof Error ? error.message : 'Failed to load documents'}
            onRetry={refetch}
          />
        ) : docs.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="No documents yet"
            description="Add a document to start building your knowledge base."
            action={
              <button className="btn-primary" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4" />
                Add document
              </button>
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur">
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 text-right font-medium">Chunks</th>
                <th className="px-3 py-3 font-medium">Updated</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr
                  key={doc.id}
                  className="cursor-pointer border-b border-slate-800/60 transition hover:bg-slate-900/50"
                  onClick={() => setDetailId(doc.id)}
                >
                  <td className="max-w-0 px-6 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-200" title={doc.title}>
                          {doc.title}
                        </p>
                        {doc.source && (
                          <p className="truncate text-xs text-slate-500" title={doc.source}>
                            {doc.source}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-slate-300">{doc.chunkCount}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-400">
                    {formatRelative(doc.updatedAt)}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-ghost px-2 py-1.5"
                        title="Re-chunk & re-embed"
                        disabled={reprocess.isPending}
                        onClick={() => void onReprocess(doc)}
                      >
                        {reprocess.isPending && reprocess.variables === doc.id ? (
                          <Spinner />
                        ) : (
                          <RotateCw className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        className="btn-ghost px-2 py-1.5 hover:text-rose-400"
                        title="Delete"
                        onClick={() => setDeleteDoc(doc)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && (
        <Pagination skip={skip} take={PAGE_SIZE} total={data.total} onChange={setSkip} />
      )}

      <AddDocumentModal open={addOpen} onClose={() => setAddOpen(false)} />
      <DocumentDetailModal
        id={detailId}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
      />
      <ConfirmDialog
        open={deleteDoc !== null}
        title="Delete document"
        message={`Delete “${deleteDoc?.title}” and all of its chunks? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onConfirm={() => void onDelete()}
        onCancel={() => setDeleteDoc(null)}
      />
    </div>
  );
}
