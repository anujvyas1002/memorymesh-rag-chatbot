import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry auth/client errors — only transient network/server issues.
        if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

/** Centralized query keys so invalidation stays consistent across hooks. */
export const queryKeys = {
  health: ['health'] as const,
  documents: (params?: unknown) => ['documents', params ?? {}] as const,
  document: (id: string) => ['documents', 'detail', id] as const,
  conversations: (params?: unknown) => ['conversations', params ?? {}] as const,
  conversation: (id: string) => ['conversations', 'detail', id] as const,
};
