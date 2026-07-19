import axios, { AxiosError, type AxiosInstance } from 'axios';
import { getApiKey } from './apiKey';
import type {
  ApiErrorBody,
  AskRequest,
  ChatAnswer,
  CommonResponse,
  ConversationResponse,
  DocumentResponse,
  HealthStatus,
  IngestDocumentRequest,
  ListParams,
  ListResponse,
  SearchQueryRequest,
  SearchResult,
  UploadDocumentFields,
} from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** A normalized error surfaced to the UI from any failed request. */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, status: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.status = status;
    this.details = details;
  }
}

const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the shared-secret header (if set) to every outgoing request.
http.interceptors.request.use((config) => {
  const key = getApiKey();
  if (key.length > 0) {
    config.headers.set('x-api-key', key);
  }
  return config;
});

// Normalize axios/network errors into a single ApiError type.
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response) {
      const body = error.response.data;
      const message =
        (body && typeof body.message === 'string' && body.message) ||
        error.message ||
        'Request failed';
      throw new ApiError(message, error.response.status, body?.status ?? 'error', body?.details);
    }
    if (error.request) {
      throw new ApiError(
        'Cannot reach the API. Is the backend running?',
        0,
        'network_error',
      );
    }
    throw new ApiError(error.message, 0, 'error');
  },
);

const unwrap = <T>(payload: CommonResponse<T>): T => payload.data;

/** Strongly-typed wrapper around every RAG API endpoint. */
export const api = {
  // --- Health -------------------------------------------------------------
  async health(): Promise<HealthStatus> {
    const { data } = await http.get<CommonResponse<HealthStatus>>('/health');
    return unwrap(data);
  },

  // --- Documents ----------------------------------------------------------
  async listDocuments(params: ListParams = {}): Promise<ListResponse<DocumentResponse>> {
    const { data } = await http.get<CommonResponse<ListResponse<DocumentResponse>>>('/documents', {
      params,
    });
    return unwrap(data);
  },

  async getDocument(id: string): Promise<DocumentResponse> {
    const { data } = await http.get<CommonResponse<DocumentResponse>>(`/documents/${id}`);
    return unwrap(data);
  },

  async ingestDocument(body: IngestDocumentRequest): Promise<DocumentResponse> {
    const { data } = await http.post<CommonResponse<DocumentResponse>>('/documents', body);
    return unwrap(data);
  },

  async uploadDocument(file: File, fields: UploadDocumentFields = {}): Promise<DocumentResponse> {
    const form = new FormData();
    form.append('file', file);
    if (fields.title) {
      form.append('title', fields.title);
    }
    if (fields.source) {
      form.append('source', fields.source);
    }
    const { data } = await http.post<CommonResponse<DocumentResponse>>('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(data);
  },

  async reprocessDocument(id: string): Promise<DocumentResponse> {
    const { data } = await http.post<CommonResponse<DocumentResponse>>(`/documents/${id}/reprocess`);
    return unwrap(data);
  },

  async deleteDocument(id: string): Promise<void> {
    await http.delete<CommonResponse<null>>(`/documents/${id}`);
  },

  // --- Search -------------------------------------------------------------
  async search(body: SearchQueryRequest): Promise<ListResponse<SearchResult>> {
    const { data } = await http.post<CommonResponse<ListResponse<SearchResult>>>('/search', body);
    return unwrap(data);
  },

  // --- Chat ---------------------------------------------------------------
  async ask(body: AskRequest): Promise<ChatAnswer> {
    const { data } = await http.post<CommonResponse<ChatAnswer>>('/chat/ask', body);
    return unwrap(data);
  },

  async listConversations(params: ListParams = {}): Promise<ListResponse<ConversationResponse>> {
    const { data } = await http.get<CommonResponse<ListResponse<ConversationResponse>>>(
      '/chat/conversations',
      { params },
    );
    return unwrap(data);
  },

  async getConversation(id: string): Promise<ConversationResponse> {
    const { data } = await http.get<CommonResponse<ConversationResponse>>(
      `/chat/conversations/${id}`,
    );
    return unwrap(data);
  },

  async deleteConversation(id: string): Promise<void> {
    await http.delete<CommonResponse<null>>(`/chat/conversations/${id}`);
  },
};
