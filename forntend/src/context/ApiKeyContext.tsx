import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import { getApiKey, setApiKey, subscribeApiKey } from '../lib/apiKey';

interface ApiKeyContextValue {
  apiKey: string;
  hasApiKey: boolean;
  setApiKey: (key: string) => void;
}

const ApiKeyContext = createContext<ApiKeyContextValue | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const apiKey = useSyncExternalStore(subscribeApiKey, getApiKey, getApiKey);

  const value: ApiKeyContextValue = {
    apiKey,
    hasApiKey: apiKey.length > 0,
    setApiKey,
  };

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApiKey(): ApiKeyContextValue {
  const ctx = useContext(ApiKeyContext);
  if (ctx === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return ctx;
}
