/**
 * Tiny observable store for the `x-api-key` shared secret.
 *
 * Lives outside React so the axios request interceptor can read the current key
 * synchronously, while the React `ApiKeyProvider` subscribes for re-renders.
 * The key is persisted to localStorage and seeded from `VITE_API_KEY` on first run.
 */

const STORAGE_KEY = 'rag.apiKey';

const readInitial = (): string => {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_API_KEY ?? '';
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    return stored;
  }
  return import.meta.env.VITE_API_KEY ?? '';
};

let currentKey = readInitial();
const listeners = new Set<() => void>();

export const getApiKey = (): string => currentKey;

export const setApiKey = (key: string): void => {
  currentKey = key;
  if (typeof window !== 'undefined') {
    if (key.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, key);
    }
  }
  listeners.forEach((listener) => listener());
};

export const subscribeApiKey = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
