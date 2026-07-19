# 🧠 MemoryMesh

A Retrieval-Augmented Generation (RAG) chatbot that answers questions from your own documents using **Google Gemini**, **vector search**, and **source citations**. MemoryMesh provides grounded, traceable responses by retrieving relevant document context before generating an answer.

## ✨ Features

* 📄 Upload PDF, Markdown, JSON, and Text documents
* 🤖 Ask questions in natural language
* 🔍 Semantic search using vector embeddings
* 📚 Retrieval-Augmented Generation (RAG)
* 📌 Source citations for every answer
* 🚫 Minimized hallucinations through context-aware responses
* ⚡ Fast and scalable vector search

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* NestJS
* TypeScript
* Google Gemini API
* Vector Database
* REST API

## 📂 Project Structure

```text
memorymesh/
├── frontend/          # React application
├── nest-js/           # NestJS backend
├── README.md
└── .gitignore
```

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/<your-username>/memorymesh.git
cd memorymesh
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd nest-js
npm install
npm run start:dev
```

## 📖 How It Works

1. Upload one or more documents.
2. Documents are parsed and converted into vector embeddings.
3. Embeddings are stored in a vector database.
4. A user asks a question.
5. The backend retrieves the most relevant document chunks.
6. Gemini generates an answer using only the retrieved context.
7. The response includes citations pointing to the original document sources.

## 🎯 Future Enhancements

* Authentication and authorization
* Chat history
* Multiple workspaces
* OCR support
* Hybrid search
* Streaming responses
* Additional document formats (DOCX, XLSX)

## 📄 License

MIT License
