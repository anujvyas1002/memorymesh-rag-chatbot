# RAG Console — Frontend

A React + TypeScript single-page app for the [RAG API](../backend). It exposes every backend
capability through a clean console UI:

| Page          | Backend endpoints                                                             |
| ------------- | ---------------------------------------------------------------------------- |
| **Chat**      | `POST /chat/ask`, `GET /chat/conversations`, `GET /chat/conversations/:id`, `DELETE /chat/conversations/:id` |
| **Documents** | `POST /documents`, `POST /documents/upload`, `GET /documents`, `GET /documents/:id`, `POST /documents/:id/reprocess`, `DELETE /documents/:id` |
| **Search**    | `POST /search`                                                               |
| Sidebar       | `GET /health` (live status badge)                                            |

Highlights:

- **Grounded chat** with streamed-feel UX, markdown rendering, and expandable `[n]` source citations.
- **Conversation history** — list, resume, and delete past conversations.
- **Document management** — ingest raw text (with JSON metadata) or drag-and-drop upload `.txt`/`.md`/`.json`, plus reprocess and delete.
- **Vector search** with adjustable `topK` / `minScore` retrieval knobs (shared with chat).
- **API-key auth** — set the `x-api-key` shared secret in-app (persisted locally) or via `VITE_API_KEY`.
- **Live health badge** showing DB, embedding provider, and LLM provider status.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · TanStack Query · React Router · Axios · react-markdown.

## Getting started

```bash
cd frontend
npm install
cp .env.example .env   # adjust if your backend isn't on http://localhost:3000
npm run dev            # http://localhost:5173
```

The dev server proxies `/api` to the backend (`VITE_API_PROXY_TARGET`, default `http://localhost:3000`),
so make sure the NestJS API is running first (`cd ../backend && npm run start:dev`).

### Environment variables

| Variable                 | Default                 | Purpose                                                        |
| ------------------------ | ----------------------- | ------------------------------------------------------------- |
| `VITE_API_BASE_URL`      | `/api`                  | Base path for API calls. Set to an absolute URL for a remote backend. |
| `VITE_API_PROXY_TARGET`  | `http://localhost:3000` | Where the dev server proxies `/api` (development only).        |
| `VITE_API_KEY`           | _(empty)_               | Optional `x-api-key`. Can also be set at runtime in the UI.    |

## Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the Vite dev server.           |
| `npm run build`    | Type-check and build for production. |
| `npm run preview`  | Preview the production build.        |
| `npm run lint`     | Lint with ESLint.                    |
| `npm run format`   | Format with Prettier.                |

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview
```

When deploying behind the same origin as the API, keep `VITE_API_BASE_URL=/api`. For a separate
origin, set it to the full API URL (e.g. `https://api.example.com/api`) and ensure the backend's
`CORS_ORIGIN` allows the frontend origin.
