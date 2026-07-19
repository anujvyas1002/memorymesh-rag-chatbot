import { FileText, Search as SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { RetrievalSettings, type RetrievalOptions } from '../components/RetrievalSettings';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState, ErrorState } from '../components/ui/States';
import { useToast } from '../context/ToastContext';
import { useSearch } from '../hooks/useSearch';
import { ApiError } from '../lib/api';
import { formatScore } from '../lib/format';

export function SearchPage() {
  const { error: toastError } = useToast();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<RetrievalOptions>({});
  const [lastQuery, setLastQuery] = useState('');
  const search = useSearch();

  const submit = async () => {
    const trimmed = query.trim();
    if (trimmed.length === 0 || search.isPending) {
      return;
    }
    setLastQuery(trimmed);
    try {
      await search.mutateAsync({ query: trimmed, topK: options.topK, minScore: options.minScore });
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Search failed');
    }
  };

  const results = search.data?.items ?? [];

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Vector Search"
        description="Pure cosine-similarity search over document chunks — no answer generation."
      />

      <div className="border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-9"
              placeholder="Search your knowledge base…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void submit()}
              autoFocus
            />
          </div>
          <RetrievalSettings value={options} onChange={setOptions} />
          <button
            className="btn-primary"
            onClick={() => void submit()}
            disabled={search.isPending || query.trim().length === 0}
          >
            {search.isPending ? <Spinner /> : <SearchIcon className="h-4 w-4" />}
            Search
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {search.isPending ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
            <Spinner /> Searching…
          </div>
        ) : search.isError ? (
          <ErrorState
            message={search.error instanceof Error ? search.error.message : 'Search failed'}
            onRetry={() => void submit()}
          />
        ) : !search.isSuccess ? (
          <EmptyState
            icon={<SearchIcon className="h-6 w-6" />}
            title="Search across your documents"
            description="Enter a query to retrieve the most semantically similar chunks, ranked by cosine similarity."
          />
        ) : results.length === 0 ? (
          <EmptyState
            icon={<SearchIcon className="h-6 w-6" />}
            title="No matching chunks"
            description={`Nothing matched “${lastQuery}”. Try lowering the minimum score or rephrasing.`}
          />
        ) : (
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-xs text-slate-500">
              {results.length} result{results.length === 1 ? '' : 's'} for “{lastQuery}”
            </p>
            <ul className="space-y-3">
              {results.map((r, i) => (
                <li key={r.chunkId} className="card animate-fade-in p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-slate-800 font-mono text-xs text-slate-400">
                      {i + 1}
                    </span>
                    <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                    <span className="truncate font-medium text-slate-200" title={r.documentTitle}>
                      {r.documentTitle}
                    </span>
                    <span className="ml-auto shrink-0 rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-xs text-emerald-300">
                      {formatScore(r.score)}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center gap-3 text-[11px] text-slate-500">
                    <span>chunk #{r.chunkIndex}</span>
                    {r.source && (
                      <span className="truncate" title={r.source}>
                        {r.source}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{r.content}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
