import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryClient';

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => api.health(),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
