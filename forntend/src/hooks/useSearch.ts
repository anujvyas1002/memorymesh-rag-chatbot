import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { SearchQueryRequest } from '../lib/types';

/**
 * Search is modeled as a mutation rather than a query: it is an explicit,
 * user-triggered action (POST) and we don't want it auto-refetching.
 */
export function useSearch() {
  return useMutation({
    mutationFn: (body: SearchQueryRequest) => api.search(body),
  });
}
