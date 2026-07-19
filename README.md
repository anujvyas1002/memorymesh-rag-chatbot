# memorymesh-rag-chatbot
A RAG chatbot that answers questions from your documents using Gemini, vector search, and citations—providing grounded, traceable responses instead of hallucinations.

# 🧠 MemoryMesh

> A RAG (Retrieval-Augmented Generation) chatbot that answers questions from your own documents with grounded, traceable responses and source citations.

## ✨ Features

* 📄 Upload documents (PDF, TXT, Markdown, JSON)
* 🤖 Ask questions in natural language
* 🔍 Semantic search using vector embeddings
* 📚 Retrieval-Augmented Generation (RAG)
* 📌 Source citations for every answer
* 🚫 Reduces hallucinations by answering only from retrieved context
* ⚡ Fast and scalable document retrieval

## 🏗️ Architecture

```
          +----------------+
          |   User Upload  |
          +-------+--------+
                  |
                  v
        +-------------------+
        | Document Parser   |
        +-------------------+
                  |
                  v
       +---------------------+
       | Generate Embeddings |
       +---------------------+
                  |
                  v
      +-----------------------+
      |   Vector Database     |
      +-----------------------+
                  |
                  |
User Question ----+
                  |
                  v
      +-----------------------+
      | Semantic Retrieval    |
      +-----------------------+
                  |
                  v
      +-----------------------+
      | Gemini API            |
      +-----------------------+
                  |
                  v
      Grounded Answer + Citations
```

## 🛠️ Tech Stack

* Java / Spring Boot
* Gemini API
* Vector Database
* Embedding Model
* REST APIs
* Maven

## 📂 Supported Documents

* PDF
* Markdown (.md)
* JSON
* Text (.txt)

## 🚀 How It Works

1. Upload one or more documents.
2. The application extracts text from the documents.
3. Text is converted into vector embeddings.
4. Embeddings are stored in a vector database.
5. When a question is asked, the most relevant document chunks are retrieved.
6. Gemini generates an answer using only the retrieved context.
7. Every answer includes citations to the original document.

## 📸 Example

### Question

```
What is Retrieval-Augmented Generation?
```

### Answer

```
Retrieval-Augmented Generation (RAG) combines semantic search with a Large Language Model. Instead of relying only on the model's knowledge, it retrieves the most relevant document chunks and generates an answer using that context. [1]

Sources:
[1] rag-guide.pdf
```

## 📁 Project Structure

```
memorymesh
├── backend
├── frontend
├── docs
├── uploads
├── README.md
└── pom.xml
```

## 🎯 Future Enhancements

* User authentication
* Chat history
* Multiple workspaces
* Hybrid search
* Streaming responses
* OCR support for scanned PDFs
* Support for DOCX and Excel files
* Conversation memory

## 🤝 Contributing

Contributions are welcome. Feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License.

---

**MemoryMesh** helps users chat with their own documents using Retrieval-Augmented Generation (RAG), delivering accurate, grounded answers with transparent source citations.
