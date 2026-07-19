# RAG API (NestJS)

A production-style **Retrieval-Augmented Generation** backend built with NestJS + TypeScript.
It ingests documents, splits them into overlapping chunks, embeds the chunks with **Google
Gemini**, stores the vectors in **PostgreSQL + pgvector**, and answers questions by retrieving
the most relevant chunks and generating a grounded, **cited** answer with **Anthropic Claude**.

> Stack: NestJS 10 · TypeScript (strict) · TypeORM · PostgreSQL + pgvector · Gemini embeddings · Claude generation

---

## 1. How RAG works here

```
                    ┌──────────────── Ingestion ─────────────────┐
  POST /documents → DocumentService → ChunkingService → Gemini embeddings → pgvector
                                                                   (document_chunks.embedding)

                    ┌──────────────── Querying ──────────────────┐
  POST /chat/ask  → embed question (Gemini) → RetrievalService (cosine top-K)
                  → PromptBuilder (context + citation rules) → Claude → grounded answer + citations
```

- **Chunking** — sliding character window with overlap, snapped to natural boundaries
  (`ChunkingService`). Tunable via `RAG_CHUNK_SIZE` / `RAG_CHUNK_OVERLAP`.
- **Embeddings** — `gemini-embedding-001` (768-dim via `outputDimensionality`) over `@google/genai`, batched.
- **Vector store** — pgvector `vector(768)` column with an **HNSW** cosine index; search uses
  the `<=>` operator and reports cosine similarity as `1 - distance`.
- **Generation** — Claude Messages API; the retrieved passages are injected as a numbered
  context block and the model is instructed to cite them as `[1]`, `[2]`, … and to refuse
  when the answer is not in context.

---

## 2. Architecture

Feature-modular, strictly layered (controllers are thin, services own logic, integrations are
framework-agnostic wrappers behind interfaces).

```
src/
├── common/
│   ├── config/                 # app, db, auth, embedding, llm, rag config factories (+ Joi)
│   ├── decorators/             # @Public()
│   ├── dto/                    # CommonResponseDto, ListResponseDto, ListQueryParamDto
│   ├── exceptions/             # AppException, AppWarningException
│   ├── filters/                # AllExceptionFilter (uniform error shape)
│   ├── guards/                 # ApiKeyGuard (global)
│   ├── services/               # Integration layer:
│   │   ├── embedding-provider.interface.ts   (EMBEDDING_PROVIDER token)
│   │   ├── gemini-embedding.service.ts
│   │   ├── llm-provider.interface.ts         (LLM_PROVIDER token)
│   │   └── claude-chat.service.ts
│   └── common.module.ts        # @Global — binds tokens → implementations
│
├── db/
│   ├── data-source.ts          # TypeORM CLI DataSource
│   └── migrations/             # InitRagSchema (vector extension + tables + HNSW index)
│
├── modules/
│   ├── knowledge/              # Ingestion + retrieval (owns documents + chunks)
│   │   ├── entities/           # DocumentEntity, DocumentChunkEntity
│   │   ├── services/           # ChunkingService, RetrievalService, DocumentService
│   │   └── controllers/        # DocumentController, SearchController
│   └── chat/                   # RAG Q&A (owns conversations + messages)
│       ├── entities/           # ConversationEntity, MessageEntity
│       ├── services/           # PromptBuilderService, ChatService
│       └── controllers/        # ChatController
│
├── shared/interfaces/          # Config type definitions
├── app.module.ts · app.controller.ts (health) · app.service.ts · main.ts
```

**Swapping providers** — change the `useClass` bindings in `common/common.module.ts`. Callers
depend only on `IEmbeddingProvider` / `ILlmProvider`, never the concrete classes.

---

## 3. Prerequisites

- Node.js 18+
- PostgreSQL 14+ with the **pgvector** extension installed on the server
  (the initial migration runs `CREATE EXTENSION IF NOT EXISTS vector`).
- A **Gemini API key** (embeddings) and an **Anthropic API key** (generation).

Quick pgvector via Docker:

```bash
docker run -d --name rag-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=rag \
  -p 5432:5432 pgvector/pgvector:pg16
```

---

## 4. Setup

```bash
npm install
cp .env.example .env          # then fill in GEMINI_API_KEY and ANTHROPIC_API_KEY
npm run migration:run         # creates extension, tables, and HNSW index
npm run start:dev
```

Swagger UI: `http://localhost:3000/api/docs`

> **Embedding dimension** — the migration hard-codes `vector(768)`. `gemini-embedding-001`
> defaults to 3072 dimensions, so the service requests `EMBEDDING_DIMENSIONS` via
> `outputDimensionality`. If you change `EMBEDDING_MODEL`/`EMBEDDING_DIMENSIONS`, update the
> column type in the migration accordingly.

---

## 5. Configuration (`.env`)

| Key | Default | Purpose |
|---|---|---|
| `PORT` / `API_PREFIX` / `CORS_ORIGIN` | `3000` / `api` / `*` | HTTP server |
| `DB_*` | — | PostgreSQL connection |
| `API_KEY` | _(empty)_ | If set, every non-`@Public` route requires `x-api-key`. Empty = guard disabled |
| `GEMINI_API_KEY` | — | Embeddings |
| `EMBEDDING_MODEL` / `EMBEDDING_DIMENSIONS` / `EMBEDDING_BATCH_SIZE` | `gemini-embedding-001` / `768` / `64` | Embedding behaviour |
| `ANTHROPIC_API_KEY` / `CLAUDE_MODEL` / `CLAUDE_MAX_TOKENS` | — / `claude-sonnet-4-6` / `1024` | Generation |
| `RAG_CHUNK_SIZE` / `RAG_CHUNK_OVERLAP` | `1200` / `200` | Chunking (characters) |
| `RAG_TOP_K` / `RAG_MIN_SCORE` | `5` / `0.2` | Retrieval depth + similarity floor |
| `RAG_HISTORY_LIMIT` | `10` | Prior turns replayed to the model |

---

## 6. API

All responses use a uniform envelope: `{ message, status, statusCode, data }`.
If `API_KEY` is set, send header `x-api-key: <key>` (everything except `GET /api/health`).

### Ingest a document
```bash
curl -X POST http://localhost:3000/api/documents \
  -H 'content-type: application/json' \
  -d '{
    "title": "Leave Policy 2026",
    "content": "Employees are entitled to 24 days of paid leave per calendar year. Unused leave...",
    "source": "intranet/hr/leave-policy",
    "metadata": { "department": "HR" }
  }'
```

### Upload a file (`.txt` / `.md` / `.json`, ≤5MB)
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F 'file=@./handbook.md' -F 'title=Employee Handbook'
```

### Pure semantic search (no generation)
```bash
curl -X POST http://localhost:3000/api/search \
  -H 'content-type: application/json' \
  -d '{ "query": "how much paid leave?", "topK": 5 }'
```

### Ask (full RAG, grounded + cited)
```bash
curl -X POST http://localhost:3000/api/chat/ask \
  -H 'content-type: application/json' \
  -d '{ "question": "How many paid leave days do employees get per year?" }'
```
Response `data`:
```json
{
  "conversationId": "…",
  "answer": "Employees get 24 days of paid leave per year [1].",
  "citations": [
    { "index": 1, "documentTitle": "Leave Policy 2026", "score": 0.83, "snippet": "Employees are entitled to 24 days…" }
  ],
  "retrievedCount": 1
}
```
Continue the conversation by passing the returned `conversationId` on the next `ask`.

### Other endpoints
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | DB + provider status (public) |
| `GET` | `/api/documents` | List documents (paginated) |
| `GET` | `/api/documents/:id` | Get a document |
| `POST` | `/api/documents/:id/reprocess` | Re-chunk + re-embed |
| `DELETE` | `/api/documents/:id` | Delete document + chunks |
| `GET` | `/api/chat/conversations` | List conversations |
| `GET` | `/api/chat/conversations/:id` | Conversation with full history |
| `DELETE` | `/api/chat/conversations/:id` | Delete conversation |

---

## 7. Scripts

| Script | Description |
|---|---|
| `npm run start:dev` | Watch-mode dev server |
| `npm run build` | Compile to `dist/` |
| `npm run lint` | ESLint (zero warnings allowed) |
| `npm run migration:run` / `:revert` | Apply / roll back migrations |
| `npm run migration:generate` | Generate a migration from entity changes |

---

## 8. Notes & extension points

- The `embedding` vector column is **not** ORM-mapped (TypeORM has no vector type); it is read
  and written via parameterized raw SQL in `RetrievalService` / `DocumentService`.
- Ingestion is synchronous for clarity. For large corpora, move `DocumentService.process` to a
  background job/queue and let `POST /documents` return `pending` immediately.
- PDF/DOCX ingestion: add a parser (e.g. `pdf-parse`) in the upload path and feed extracted
  text into `DocumentService.ingest`.
- Auth is a single shared API key for simplicity. Replace `ApiKeyGuard` with JWT + per-tenant
  scoping for multi-user deployments.
```
