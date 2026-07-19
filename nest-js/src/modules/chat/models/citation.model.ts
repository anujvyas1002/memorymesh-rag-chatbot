/** A source citation attached to an assistant answer. */
export interface CitationModel {
  /** 1-based index referenced as [n] in the answer text. */
  index: number;
  chunkId: string;
  documentId: string;
  documentTitle: string;
  source: string | null;
  score: number;
  snippet: string;
}

export interface ChatAnswerModel {
  conversationId: string;
  answer: string;
  citations: CitationModel[];
  retrievedCount: number;
}
