/**
 * TypeScript mirrors of the backend's response/request DTOs.
 * Keep these in sync with `backend/src/**` — they define the API contract the UI relies on.
 */

/** Every successful response from the API is wrapped in this envelope. */
export interface CommonResponse<T> {
  message: string;
  status: string;
  statusCode: number;
  data: T;
}

/** Paginated collection payload (`data` of a list endpoint). */
export interface ListResponse<T> {
  items: T[];
  total: number;
}

/** Shape of the JSON body returned by the global exception filter. */
export interface ApiErrorBody {
  message: string;
  status: string;
  statusCode: number;
  path?: string;
  timestamp?: string;
  details?: unknown;
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export interface HealthStatus {
  status: 'ok' | 'degraded';
  database: 'up' | 'down';
  embeddingProvider: string;
  llmProvider: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface DocumentResponse {
  id: string;
  title: string;
  source: string | null;
  status: DocumentStatus;
  chunkCount: number;
  metadata: Record<string, unknown> | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IngestDocumentRequest {
  title: string;
  content: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface UploadDocumentFields {
  title?: string;
  source?: string;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchQueryRequest {
  query: string;
  topK?: number;
  minScore?: number;
}

export interface SearchResult {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  source: string | null;
  chunkIndex: number;
  content: string;
  score: number;
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export type MessageRole = 'user' | 'assistant';

export interface Citation {
  index: number;
  chunkId: string;
  documentId: string;
  documentTitle: string;
  source: string | null;
  score: number;
  snippet: string;
}

export interface AskRequest {
  question: string;
  conversationId?: string;
  topK?: number;
  minScore?: number;
}

export interface ChatAnswer {
  conversationId: string;
  answer: string;
  citations: Citation[];
  retrievedCount: number;
}

export interface MessageResponse {
  id: string;
  role: MessageRole;
  content: string;
  sources: Citation[] | null;
  createdAt: string;
}

export interface ConversationResponse {
  id: string;
  title: string | null;
  messages?: MessageResponse[];
  createdAt: string;
  updatedAt: string;
}

/** Standard pagination params accepted by list endpoints. */
export interface ListParams {
  skip?: number;
  take?: number;
}
