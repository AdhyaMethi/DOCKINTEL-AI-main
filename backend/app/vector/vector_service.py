from typing import List, Dict, Any
from backend.app.models.chunk import DocumentChunk
from backend.app.models.document import Document
from backend.app.ai.embedding_service import EmbeddingService


class VectorService:
    """Vector database service supporting cosine similarity retrieval and pgvector abstraction."""

    @classmethod
    def search_similar_chunks(
        cls,
        query_vector: List[float],
        user_id: str,
        document_ids: List[str] = None,
        top_k: int = 5,
        min_score: float = 0.05,
    ) -> List[Dict[str, Any]]:
        """Performs vector similarity search across authorized document chunks."""
        if not query_vector:
            return []

        # Query chunks belonging to authorized documents
        query = DocumentChunk.query.join(Document, DocumentChunk.document_id == Document.id)
        
        # User authorization filter
        query = query.filter(Document.user_id == user_id, Document.status == "completed")

        # Specific document IDs filter if provided
        if document_ids:
            query = query.filter(DocumentChunk.document_id.in_(document_ids))

        chunks = query.all()
        if not chunks:
            return []

        # Calculate cosine similarity scores
        scored_results: List[Dict[str, Any]] = []
        for chunk in chunks:
            chunk_embedding = chunk.get_embedding()
            if not chunk_embedding:
                continue

            sim_score = EmbeddingService.cosine_similarity(query_vector, chunk_embedding)
            if sim_score >= min_score:
                doc = chunk.document
                scored_results.append({
                    "chunk_id": chunk.id,
                    "document_id": chunk.document_id,
                    "document_title": doc.title if doc else "Document",
                    "document_type": doc.document_type if doc else "General",
                    "page_number": chunk.page_number or 1,
                    "chunk_index": chunk.chunk_index,
                    "text_content": chunk.text_content,
                    "score": round(sim_score, 4),
                })

        # Sort descending by similarity score
        sorted_results = sorted(scored_results, key=lambda x: x["score"], reverse=True)
        return sorted_results[:top_k]
