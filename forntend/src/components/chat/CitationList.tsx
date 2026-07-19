import { ChevronDown, FileText } from 'lucide-react';
import { useState } from 'react';
import { formatScore } from '../../lib/format';
import type { Citation } from '../../lib/types';

export function CitationList({ citations }: { citations: Citation[] }) {
  const [open, setOpen] = useState(false);

  if (citations.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-slate-800 pt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-slate-200"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        {citations.length} source{citations.length === 1 ? '' : 's'}
      </button>

      {open && (
        <ul className="mt-2 space-y-2">
          {citations.map((c) => (
            <li key={c.chunkId} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-xs">
              <div className="mb-1 flex items-center gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-brand-600/20 font-mono text-[10px] font-semibold text-brand-300">
                  {c.index}
                </span>
                <FileText className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <span className="truncate font-medium text-slate-200" title={c.documentTitle}>
                  {c.documentTitle}
                </span>
                <span className="ml-auto shrink-0 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">
                  {formatScore(c.score)}
                </span>
              </div>
              {c.source && <p className="mb-1 truncate text-[11px] text-slate-500">{c.source}</p>}
              <p className="leading-relaxed text-slate-400">{c.snippet}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
