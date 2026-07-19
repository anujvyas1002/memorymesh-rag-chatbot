/** Small presentation helpers shared across pages. */

export const formatDateTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelative = (iso: string): string => {
  const date = new Date(iso).getTime();
  if (Number.isNaN(date)) {
    return iso;
  }
  const diffSeconds = Math.round((date - Date.now()) / 1000);
  const ranges: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1],
  ];
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  for (const [unit, secondsInUnit] of ranges) {
    if (Math.abs(diffSeconds) >= secondsInUnit || unit === 'second') {
      return formatter.format(Math.round(diffSeconds / secondsInUnit), unit);
    }
  }
  return 'just now';
};

/** Format a cosine similarity score in [0,1] as a percentage. */
export const formatScore = (score: number): string => `${(score * 100).toFixed(1)}%`;
