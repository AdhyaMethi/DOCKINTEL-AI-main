import re
from typing import Dict, Any, List
from flask import current_app
from backend.app.extensions import db
from backend.app.models.user import User
from backend.app.models.document import Document
from backend.app.models.chunk import DocumentChunk
from backend.app.models.search_history import SearchHistory
from backend.app.ai.embedding_service import EmbeddingService
from backend.app.vector.vector_service import VectorService


class SearchService:
    """Keyword, Full-text, and Semantic Vector Search Engine."""

    @classmethod
    def keyword_search(
        cls,
        user: User,
        query: str,
        document_type: str = "",
        page: int = 1,
        per_page: int = 10,
    ) -> Dict[str, Any]:
        """Performs lexical search across document titles, text, keywords, and entities."""
        query_str = (query or "").strip()
        if not query_str:
            return {"items": [], "total": 0, "page": page, "pages": 0}

        doc_query = Document.query.filter(Document.status == "completed")
        if not user.is_admin():
            doc_query = doc_query.filter(Document.user_id == user.id)

        if document_type and document_type != "all":
            doc_query = doc_query.filter(Document.document_type == document_type)

        search_filter = (
            Document.title.ilike(f"%{query_str}%") |
            Document.original_filename.ilike(f"%{query_str}%") |
            Document.cleaned_text.ilike(f"%{query_str}%") |
            Document.metadata_json.ilike(f"%{query_str}%")
        )
        doc_query = doc_query.filter(search_filter)

        paginated = doc_query.paginate(page=page, per_page=per_page, error_out=False)

        results = []
        for doc in paginated.items:
            # Find relevant snippet from cleaned text
            snippet = cls._extract_highlight_snippet(doc.cleaned_text or "", query_str)
            results.append({
                "document_id": doc.id,
                "document_title": doc.title,
                "document_type": doc.document_type,
                "file_extension": doc.file_extension,
                "snippet": snippet,
                "score": 1.0,
                "created_at": doc.created_at.isoformat() if doc.created_at else None,
            })

        # Save history
        history = SearchHistory(user_id=user.id, query=query_str, search_type="keyword", result_count=paginated.total)
        history.set_filters({"document_type": document_type})
        db.session.add(history)
        db.session.commit()

        return {
            "items": results,
            "total": paginated.total,
            "page": paginated.page,
            "per_page": paginated.per_page,
            "pages": paginated.pages,
        }

    @classmethod
    def semantic_search(
        cls,
        user: User,
        query: str,
        document_ids: List[str] = None,
        document_type: str = None,
        top_k: int = 8,
        min_score: float = 0.05,
    ) -> Dict[str, Any]:
        """Performs dense vector semantic search across document chunks."""
        query_str = (query or "").strip()
        if not query_str:
            return {"items": [], "total": 0, "query": ""}

        # Generate query embedding
        provider = current_app.config.get("AI_PROVIDER", "fallback")
        api_key = user.custom_llm_key or current_app.config.get("OPENAI_API_KEY", "")
        query_vector = EmbeddingService.generate_embedding(query_str, api_key=api_key, provider=provider)

        # Retrieve top similar chunks
        results = VectorService.search_similar_chunks(
            query_vector=query_vector,
            user_id=user.id,
            document_ids=document_ids,
            top_k=top_k,
            min_score=min_score,
        )

        # Filter by document type if specified
        if document_type and document_type != "all":
            results = [r for r in results if r.get("document_type") == document_type]

        # Record search history
        history = SearchHistory(user_id=user.id, query=query_str, search_type="semantic", result_count=len(results))
        history.set_filters({"document_ids": document_ids, "document_type": document_type})
        db.session.add(history)
        db.session.commit()

        return {
            "query": query_str,
            "total": len(results),
            "items": results,
        }

    @staticmethod
    def _extract_highlight_snippet(text: str, query: str, context_len: int = 160) -> str:
        if not text:
            return ""
        match = re.search(re.escape(query), text, re.IGNORECASE)
        if not match:
            return text[:context_len] + ("..." if len(text) > context_len else "")
        
        start = max(0, match.start() - 60)
        end = min(len(text), match.end() + 100)
        prefix = "..." if start > 0 else ""
        suffix = "..." if end < len(text) else ""
        return f"{prefix}{text[start:end].strip()}{suffix}"
