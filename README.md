# 🧠 MemoryMesh

> **MemoryMesh** is a Retrieval-Augmented Generation (RAG) chatbot that enables users to chat with their own documents using natural language. It retrieves the most relevant information from uploaded documents using semantic search and generates grounded, citation-backed answers with Large Language Models, ensuring accuracy and minimizing hallucinations.

---

## 🚀 Overview

Traditional AI chatbots often rely on pre-trained knowledge, which can lead to inaccurate or fabricated responses. MemoryMesh solves this by combining **semantic search**, **vector embeddings**, and **Large Language Models (LLMs)** to answer questions strictly from user-provided documents.

Every response is accompanied by **clickable source citations**, allowing users to verify where the information originated.

---

## ✨ Features

* 📄 Upload PDF, TXT, Markdown, and JSON documents
* 🤖 Natural language question answering
* 📚 Retrieval-Augmented Generation (RAG)
* 🔍 Semantic vector search
* 📌 Grounded responses with source citations
* 💬 Persistent conversation history
* 📂 Document management (upload, reprocess, delete)
* ⚙️ Configurable retrieval parameters
* 🔐 API Key Authentication
* ❤️ Live backend health monitoring

---

## 🏗️ System Architecture

```text
                    Upload Documents
                           │
                           ▼
                 Document Processing
                           │
                           ▼
                 Chunking & Embeddings
                           │
                           ▼
                 PostgreSQL + pgvector
                           │
                           ▼
                  Semantic Retrieval
                           │
                           ▼
                    Google Gemini
                           │
                           ▼
                 Grounded AI Response
                   with Source Citations
```

---

## 🛠️ Technology Stack

### Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* TanStack Query
* React Router
* Axios
* React Markdown

### Backend

* NestJS
* TypeScript
* PostgreSQL
* pgvector
* TypeORM
* Google Gemini Embeddings
* Anthropic Claude
* Swagger

---

## 📁 Project Structure

```text
MemoryMesh/
│
├── frontend/
│   ├── React + TypeScript
│   ├── Tailwind CSS
│   └── Vite
│
├── backend/
│   ├── NestJS
│   ├── PostgreSQL
│   ├── pgvector
│   └── REST APIs
│
└── README.md
```

---

## ⚙️ Getting Started

### Clone Repository

```bash
git clone https://github.com/<your-username>/memorymesh.git

cd memorymesh
```

### Backend

```bash
cd backend

npm install

cp .env.example .env

npm run migration:run

npm run start:dev
```

### Frontend

```bash
cd frontend

npm install

cp .env.example .env

npm run dev
```

---

## 📸 Application Modules

### 💬 Chat

* Grounded AI conversations
* Conversation history
* Source citations

### 📄 Document Manager

* Upload documents
* Delete documents
* Reprocess embeddings

### 🔍 Semantic Search

* Vector similarity search
* Adjustable Top-K retrieval
* Minimum similarity threshold

---

## 📖 API Documentation

Swagger UI

```text
http://localhost:3000/api/docs
```

---

## 🎯 Future Enhancements

* User Authentication (JWT/OAuth)
* OCR Support
* DOCX & Excel Support
* Streaming AI Responses
* Multi-user Workspace
* Hybrid Search (Keyword + Vector)
* Cloud Storage Integration

---

## 🏆 Hackathon Participation

This project was developed as part of a hackathon to demonstrate the practical application of **Retrieval-Augmented Generation (RAG)**, **semantic search**, and **Large Language Models** for building reliable, citation-backed AI assistants capable of answering questions from custom document collections.

The primary goal was to create an AI assistant that prioritizes **accuracy, transparency, and trust** by grounding every response in retrieved document context instead of relying solely on the model's pre-trained knowledge.

---

## 📄 License

MIT License
