import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryClient';
import type { AskRequest, ListParams } from '../lib/types';

export function useConversations(params: ListParams) {
  return useQuery({
    queryKey: queryKeys.conversations(params),
    queryFn: () => api.listConversations(params),
  });
}

export function useConversation(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.conversation(id ?? ''),
    queryFn: () => api.getConversation(id as string),
    enabled: Boolean(id),
  });
}

export function useAsk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AskRequest) => api.ask(body),
    onSuccess: (answer) => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      qc.invalidateQueries({ queryKey: queryKeys.conversation(answer.conversationId) });
    },
  });
}

export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteConversation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });
}
