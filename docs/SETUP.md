# DocIntel AI — Local Setup and Deployment Guide

## 1. Prerequisites
- Python 3.10+ (tested on Python 3.14 / 3.11)
- Node.js 18+ and npm 9+
- *(Optional)* Docker & Docker Compose
- *(Optional)* Tesseract OCR Engine (for image text extraction)
- *(Optional)* PostgreSQL with `pgvector` extension

---

## 2. Fast Local Development Setup (Zero External Dependencies)

The platform comes with zero-friction SQLite and deterministic AI/vector fallbacks enabled by default.

### Step A: Backend Setup
1. Open PowerShell or Terminal:
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\pip.exe install -r requirements.txt
   ```
2. Initialize and seed the database with demo users & processed sample documents:
   ```powershell
   .\venv\Scripts\python.exe run.py --seed
   ```
   *The backend starts automatically on `http://localhost:5000`.*

### Step B: Frontend Setup
1. In a second terminal:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser at `http://localhost:5173`.

---

## 3. Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@docintel.io` | `AdminPassword123!` | Full Admin Panel, Audit Logs, User Management, All Documents |
| **Demo User** | `demo@docintel.io` | `DemoPassword123!` | Standard User Ingestion, Chat RAG, Semantic Search, Comparison |

---

## 4. Running Backend Tests

To run the complete automated test suite:
```powershell
cd backend
.\venv\Scripts\pytest.exe -v
```

---

## 5. Docker Deployment

To launch the full production stack with PostgreSQL `pgvector`, Redis, Flask backend, and Nginx frontend:
```bash
docker-compose up --build
```
The application will be available at `http://localhost:5173` (or `http://localhost:80`).
