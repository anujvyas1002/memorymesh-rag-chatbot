import { SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface RetrievalOptions {
  topK?: number;
  minScore?: number;
}

/**
 * Popover for the shared retrieval knobs (`topK`, `minScore`).
 * Empty inputs mean "use the backend default" — they are omitted from the request.
 */
export function RetrievalSettings({
  value,
  onChange,
}: {
  value: RetrievalOptions;
  onChange: (next: RetrievalOptions) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const summary = [
    value.topK !== undefined ? `k=${value.topK}` : null,
    value.minScore !== undefined ? `≥${value.minScore}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const parseNum = (raw: string): number | undefined => {
    if (raw.trim() === '') {
      return undefined;
    }
    const n = Number(raw);
    return Number.isNaN(n) ? undefined : n;
  };

  return (
    <div className="relative" ref={ref}>
      <button type="button" className="btn-secondary" onClick={() => setOpen((o) => !o)}>
        <SlidersHorizontal className="h-4 w-4" />
        Retrieval
        {summary && <span className="ml-1 text-xs text-brand-300">{summary}</span>}
      </button>

      {open && (
        <div className="card absolute right-0 z-20 mt-2 w-64 animate-fade-in p-4">
          <div className="mb-3">
            <label className="label">Top K (1–50)</label>
            <input
              type="number"
              min={1}
              max={50}
              className="input"
              placeholder="default"
              value={value.topK ?? ''}
              onChange={(e) => onChange({ ...value, topK: parseNum(e.target.value) })}
            />
            <p className="mt-1 text-[11px] text-slate-500">Number of chunks to retrieve.</p>
          </div>
          <div>
            <label className="label">Min score (0–1)</label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              className="input"
              placeholder="default"
              value={value.minScore ?? ''}
              onChange={(e) => onChange({ ...value, minScore: parseNum(e.target.value) })}
            />
            <p className="mt-1 text-[11px] text-slate-500">Minimum cosine similarity to include.</p>
          </div>
          <button
            type="button"
            className="btn-ghost mt-3 w-full justify-center text-xs"
            onClick={() => onChange({})}
          >
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  );
}
