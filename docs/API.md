# DocIntel AI — REST API Documentation

Base URL: `http://localhost:5000/api` (or proxied via Vite at `/api`)

All authenticated endpoints require an `Authorization: Bearer <JWT_TOKEN>` header.

---

## 1. Health & Diagnostics

### `GET /api/health`
Inspects runtime service health, database connectivity, OCR availability, and AI engine status.

**Response `200 OK`**:
```json
{
  "status": "online",
  "service": "Intelligent Document Intelligence Platform API",
  "version": "1.0.0",
  "database": "healthy",
  "storage": "available",
  "ocr_engine": "installed",
  "ai_engine": {
    "mode": "fallback",
    "external_llm_ready": false,
    "fallback_summarizer": "active",
    "fallback_vectorizer": "active"
  }
}
```

---

## 2. Authentication

### `POST /api/auth/register`
Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "Password123!",
  "role": "user"
}
```

**Response `201 Created`**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-...",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "user",
      "is_active": true
    },
    "access_token": "eyJhbGciOi..."
  }
}
```

---

### `POST /api/auth/login`
Authenticate user with email/username and password.

**Request Body**:
```json
{
  "email": "demo@docintel.io",
  "password": "DemoPassword123!"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-...",
      "email": "demo@docintel.io",
      "username": "DemoUser",
      "role": "user"
    },
    "access_token": "eyJhbGciOi..."
  }
}
```

---

### `GET /api/auth/me` *(Protected)*
Fetch profile of the current authenticated user.

---

### `PATCH /api/auth/profile` *(Protected)*
Update user custom OpenAI API key, avatar, or password.

---

## 3. Document Management

### `POST /api/documents` *(Protected)*
Upload and automatically queue document for intelligence pipeline processing.

**Content-Type**: `multipart/form-data`
- `file`: Binary file (`.pdf`, `.docx`, `.txt`, `.jpg`, `.png`)
- `title` *(optional)*: Custom document title

**Response `201 Created`**:
```json
{
  "success": true,
  "message": "Document uploaded successfully and queued for processing",
  "data": {
    "id": "doc-uuid",
    "title": "Deep Learning Autonomous Systems",
    "original_filename": "paper.pdf",
    "file_size": 240592,
    "mime_type": "application/pdf",
    "status": "uploaded"
  }
}
```

---

### `GET /api/documents` *(Protected)*
List documents with filters, sorting, and pagination.

**Query Parameters**:
- `q`: Search keyword across titles
- `type`: Document category (`Resume`, `Invoice`, `Research Paper`, `Contract`, `Report`, etc.)
- `status`: Processing state (`completed`, `processing`, `failed`, `uploaded`)
- `sort_by`: `created_at`, `title`, `file_size`
- `order`: `asc` or `desc`
- `page`: Page index (default: 1)
- `per_page`: Items per page (default: 12)

---

### `GET /api/documents/<id>` *(Protected)*
Retrieve complete document record including summary, extracted entities, keywords, metadata schema, and processing jobs.

---

### `GET /api/documents/<id>/pages` *(Protected)*
Retrieve page-by-page text content for the interactive reader.

---

### `GET /api/documents/<id>/download` *(Protected)*
Download the original file.

---

### `PATCH /api/documents/<id>` *(Protected)*
Rename document title.

---

### `DELETE /api/documents/<id>` *(Protected)*
Permanently delete document, pages, chunks, and storage files.

---

### `POST /api/documents/<id>/process` *(Protected)*
Re-trigger the intelligence pipeline on an existing document.

---

### `POST /api/documents/compare` *(Protected)*
Perform sentence-level structural diff and calculate semantic vector overlap between two documents.

**Request Body**:
```json
{
  "document_id_a": "uuid-doc-1",
  "document_id_b": "uuid-doc-2"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "metrics": {
      "lexical_similarity_pct": 78.4,
      "semantic_similarity_pct": 91.2,
      "added_sentences": 12,
      "removed_sentences": 4,
      "unchanged_sentences": 45
    },
    "diff": [
      { "type": "unchanged", "text": "This Agreement is made between..." },
      { "type": "added", "text": "Section 4.2 incorporates SOC2 compliance." }
    ]
  }
}
```

---

## 4. Search

### `GET /api/search` *(Protected)*
Lexical keyword search with highlighted snippets.

---

### `POST /api/search/semantic` *(Protected)*
Dense vector semantic search across document chunks.

**Request Body**:
```json
{
  "query": "What were the Top-5 error rates on ImageNet?",
  "top_k": 5,
  "min_score": 0.05,
  "document_type": "Research Paper"
}
```

---

## 5. Conversational RAG Chat

### `POST /api/chat/sessions` *(Protected)*
Create single-document or multi-document chat session.

**Request Body**:
```json
{
  "title": "Chat with Research Paper",
  "document_id": "doc-uuid",
  "is_multi_doc": false,
  "selected_doc_ids": []
}
```

---

### `POST /api/chat/sessions/<id>/messages` *(Protected)*
Send user question, retrieve semantic chunks, and generate grounded answer with citations.

**Request Body**:
```json
{
  "content": "What is the total amount due on the invoice?"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "user_message": {
      "id": "msg-uuid-1",
      "role": "user",
      "content": "What is the total amount due on the invoice?"
    },
    "assistant_message": {
      "id": "msg-uuid-2",
      "role": "assistant",
      "content": "Based on Invoice #INV-2026-9482 (Page 1), the total amount due is $13,237.00.",
      "sources": [
        {
          "document_id": "doc-uuid",
          "document_title": "Invoice #INV-2026-9482",
          "page_number": 1,
          "excerpt": "Total Amount Due: $13,237.00",
          "score": 0.96
        }
      ]
    }
  }
}
```

---

## 6. Admin Panel *(Admin Only)*

### `GET /api/admin/stats`
### `GET /api/admin/users`
### `PATCH /api/admin/users/<id>/status`
### `PATCH /api/admin/users/<id>/role`
### `GET /api/admin/audit-logs`
