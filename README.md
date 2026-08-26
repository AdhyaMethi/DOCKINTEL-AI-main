# 🧠 DocIntel AI — Intelligent Document Intelligence Platform

> **An enterprise-grade, production-style platform that transforms unstructured documents into actionable intelligence, structured knowledge, semantic vector embeddings, and verified conversational RAG answers with citations.**

---

## 🌟 Key Features

### 1. Document Management & Ingestion
- **Multi-Format Support**: Upload and process PDF (`PyMuPDF`/`pypdf`), DOCX (`python-docx`), plain text (`TXT`), and scanned images (`JPG`, `PNG`, `JPEG`).
- **OCR Engine Abstraction**: Graceful OCR fallback using `pytesseract` and `PIL` with automatic image preprocessing.
- **MIME & File Validation**: Secure random UUID filename storage, isolated per-user directories, and MIME sniffing.
- **Repository Management**: Search, filter by document category & status, sort, rename, and download original files.

### 2. Deep NLP & Document Understanding
- **Automatic Classification**: Categorizes documents into 10 domains: *Resume, Invoice, Research Paper, Contract, Report, Certificate, Notes, Manual, General Document, and Unknown*.
- **Named Entity Recognition (NER)**: Extracts and aggregates 9 entity classes: `PERSON`, `ORGANIZATION`, `DATE`, `LOCATION`, `MONEY`, `EMAIL`, `PHONE`, `PRODUCT`, `TECHNOLOGY`.
- **Domain-Specific Metadata Extraction**: Extracts structured fields (e.g. candidate skills for Resumes, invoice numbers and totals for Invoices, DOI and abstracts for Research Papers).
- **Sentence-Aware Chunker**: Splits text into 350-token semantic chunks with 40-token overlap, preserving page references.
- **Multi-Level Summaries**: Generates Short Summaries, Detailed Narratives, and Bulleted Key Points.
- **Keyword & Keyphrase Indexing**: TF-IDF and bigram term frequency scoring.

### 3. Vector Embeddings & Semantic Search
- **Dual Vector Engine**: PostgreSQL `pgvector` for enterprise production with zero-friction in-memory / SQLite cosine similarity fallback.
- **Dense Embeddings**: Generates 128-dimensional normalized dense vector representations.
- **Semantic Vector Search**: Concept-based passage retrieval with similarity score thresholds and page citations.
- **Lexical Keyword Search**: Fast full-text search with highlighted contextual snippets.

### 4. Conversational RAG & Multi-Document Chat
- **Single-Document Chat**: Conversational Q&A grounded strictly in the document content.
- **Multi-Document Synthesis**: Select multiple documents and ask comparative questions across knowledge bases.
- **Verifiable Citations**: Every answer includes document title, page numbers, and exact excerpts.
- **AI Provider Abstraction**: Supports OpenAI API, Ollama local models, and local deterministic extractive synthesis fallback.

### 5. Visual Document Comparison & Diff
- **Sentence-Level Diff Viewer**: Highlights added (+ green), removed (- red), and unchanged sentences.
- **Dual Similarity Metrics**: Calculates both lexical sequence similarity and semantic vector cosine overlap percentages.

### 6. Role-Based Access Control (RBAC) & Compliance
- **JWT Authentication & Bcrypt Password Hashing**: Secure login, register, and protected endpoints.
- **Admin Control Plane**: User directory management, account activation/deactivation, and role assignments.
- **Compliance Audit Logs**: Immutable audit trail tracking user logins, file uploads, deletions, downloads, and administrative actions with IP addresses.

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\pip.exe install -r requirements.txt
.\venv\Scripts\python.exe run.py --seed
```
*Backend runs on `http://localhost:5000`.*

### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔑 Demo Credentials (Seeded Out-of-the-Box)

| Role | Email | Password | Features |
|---|---|---|---|
| **Administrator** | `admin@docintel.io` | `AdminPassword123!` | Admin Panel, User Management, Audit Logs, All Docs |
| **Demo User** | `demo@docintel.io` | `DemoPassword123!` | Document Upload, Semantic Search, RAG Chat, Comparison |

---

## 🧪 Running Automated Tests

```powershell
cd backend
.\venv\Scripts\pytest.exe -v
```

---

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

---

## 📂 Project Structure

```
REACT_VITE_APP/
├── README.md
├── .env.example
├── docker-compose.yml
├── run_backend.ps1 / run_backend.sh
├── run_frontend.ps1 / run_frontend.sh
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── SETUP.md
├── backend/
│   ├── run.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── app/
│   │   ├── config.py
│   │   ├── extensions.py
│   │   ├── models/
│   │   ├── document_processing/
│   │   ├── ai/
│   │   ├── vector/
│   │   ├── services/
│   │   ├── routes/
│   │   └── seed/
│   └── tests/
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api/
        ├── context/
        ├── components/
        ├── layouts/
        └── pages/
```
