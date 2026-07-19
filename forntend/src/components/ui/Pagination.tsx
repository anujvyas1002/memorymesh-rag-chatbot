import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
  skip,
  take,
  total,
  onChange,
}: {
  skip: number;
  take: number;
  total: number;
  onChange: (skip: number) => void;
}) {
  if (total <= take) {
    return null;
  }
  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(skip + take, total);
  const canPrev = skip > 0;
  const canNext = skip + take < total;

  return (
    <div className="flex items-center justify-between border-t border-slate-800 px-6 py-3 text-sm text-slate-400">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex gap-1">
        <button
          className="btn-ghost px-2 py-1.5"
          disabled={!canPrev}
          onClick={() => onChange(Math.max(0, skip - take))}
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <button
          className="btn-ghost px-2 py-1.5"
          disabled={!canNext}
          onClick={() => onChange(skip + take)}
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
