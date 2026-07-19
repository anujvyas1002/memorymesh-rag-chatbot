import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryClient';
import type { IngestDocumentRequest, ListParams, UploadDocumentFields } from '../lib/types';

export function useDocuments(params: ListParams) {
  return useQuery({
    queryKey: queryKeys.documents(params),
    queryFn: () => api.listDocuments(params),
  });
}

export function useDocument(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.document(id ?? ''),
    queryFn: () => api.getDocument(id as string),
    enabled: Boolean(id),
  });
}

export function useIngestDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: IngestDocumentRequest) => api.ingestDocument(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, fields }: { file: File; fields: UploadDocumentFields }) =>
      api.uploadDocument(file, fields),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useReprocessDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.reprocessDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}
