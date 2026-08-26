# Intelligent Document Intelligence Platform — Architecture Overview

## 1. System Architecture

```
                                  [ React Single Page App (Vite + Tailwind/CSS + Recharts) ]
                                                            │
                                                     (REST APIs / JWT)
                                                            ▼
                                        [ Flask Application Factory (run.py) ]
                                                            │
                                  ┌─────────────────────────┼─────────────────────────┐
                                  ▼                         ▼                         ▼
                         [ Document Pipeline ]      [ AI & NLP Layer ]        [ Vector Search ]
                         • PyMuPDF / pypdf          • TextRank Summarizer     • Dense 128-Dim Embeddings
                         • python-docx              • OpenAI / Ollama LLM     • Cosine Similarity Engine
                         • Tesseract / OCR          • 9-Entity Class NER      • pgvector / SQLite Backend
                         • Multi-Class Classifier   • TF-IDF Keyphrase Extractor
                                  │                         │                         │
                                  └─────────────────────────┼─────────────────────────┘
                                                            ▼
                                          [ SQLAlchemy Database Layer ]
                                          • Users & RBAC
                                          • Documents, Pages, Chunks
                                          • Entities, Keywords, Summaries
                                          • Chat Sessions & Citations
                                          • Compliance Audit Logs
```

---

## 2. Ingestion & Intelligence Pipeline

```
UPLOAD DOCUMENT
     │
     ▼
[ File Validation & MIME Sniffing ]
     │
     ▼
[ Isolated Secure File Storage (AES-256 Storage Paths) ]
     │
     ▼
[ Text Extraction Engine ] ──► (PDF / DOCX / TXT / OCR Image Fallback)
     │
     ▼
[ Text Cleaning & Unicode Normalization ]
     │
     ▼
[ Probabilistic Document Classification ] (Resume, Invoice, Paper, Contract, Report, etc.)
     │
     ▼
[ Domain Metadata Extraction ] (Skills, DOI, Invoice Line Items, Parties, Dates)
     │
     ▼
[ Named Entity Recognition (NER) ] (PERSON, ORG, DATE, MONEY, TECH, LOC, EMAIL, PHONE)
     │
     ▼
[ Sentence-Aware Semantic Chunking ] (Target 350 tokens, 40 token overlap)
     │
     ▼
[ Vector Embedding Generation ] (128-Dim Normalized Vectors)
     │
     ▼
[ Multi-Level Summarization ] (Short Summary, Detailed Overview, Key Points)
     │
     ▼
[ Keyphrase & Term Weighting ]
     │
     ▼
[ Transactional Database Commit & Processing Milestone Complete ]
```

---

## 3. RAG (Retrieval Augmented Generation) Architecture

1. **User Query Embedding**: User question is tokenized and transformed into a dense query vector.
2. **Top-K Vector Retrieval**: Chunks belonging to authorized documents are scanned using cosine similarity.
3. **Context Construction & Guardrails**: Top matching passages with page numbers and document titles are compiled.
4. **Answer Generation**: The prompt is processed by the configured LLM (OpenAI, Ollama, or Local Extractive Synthesis Engine).
5. **Citation Attribution**: Each claim is accompanied by verifiable document name, page number, and text excerpt.
