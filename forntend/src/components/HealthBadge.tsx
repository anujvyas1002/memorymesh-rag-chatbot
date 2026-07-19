import clsx from 'clsx';
import { useHealth } from '../hooks/useHealth';

export function HealthBadge() {
  const { data, isLoading, isError } = useHealth();

  const state = isError || data?.status === 'degraded' ? 'down' : isLoading ? 'loading' : 'up';

  const dot =
    state === 'up' ? 'bg-emerald-400' : state === 'down' ? 'bg-rose-400' : 'bg-amber-400 animate-pulse';
  const label =
    state === 'up' ? 'API healthy' : state === 'down' ? 'API unavailable' : 'Checking…';

  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
      title={
        data
          ? `DB: ${data.database} • Embeddings: ${data.embeddingProvider} • LLM: ${data.llmProvider}`
          : undefined
      }
    >
      <span className={clsx('h-2 w-2 rounded-full', dot)} />
      <div className="leading-tight">
        <p className="text-xs font-medium text-slate-200">{label}</p>
        {data && (
          <p className="text-[10px] text-slate-500">
            {data.embeddingProvider} · {data.llmProvider}
          </p>
        )}
      </div>
    </div>
  );
}
