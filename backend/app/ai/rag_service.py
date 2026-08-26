from typing import Dict, Any, List
from backend.app.ai.embedding_service import EmbeddingService
from backend.app.ai.llm_service import LLMService
from backend.app.vector.vector_service import VectorService
from flask import current_app


class RAGService:
    """End-to-end RAG orchestrator for single-document and multi-document question answering."""

    @classmethod
    def query(
        cls,
        question: str,
        user_id: str,
        document_ids: List[str] = None,
        custom_llm_key: str = "",
        top_k: int = 5,
    ) -> Dict[str, Any]:
        """Retrieves relevant passages and generates a contextual grounded answer with source citations."""
        if not question or not question.strip():
            return {
                "answer": "Please ask a question about your documents.",
                "sources": [],
                "provider": "none",
            }

        # 1. Generate query embedding
        provider = current_app.config.get("AI_PROVIDER", "fallback")
        api_key = custom_llm_key or current_app.config.get("OPENAI_API_KEY", "")
        query_vector = EmbeddingService.generate_embedding(question, api_key=api_key, provider=provider)

        # 2. Vector Search top relevant chunks
        relevant_chunks = VectorService.search_similar_chunks(
            query_vector=query_vector,
            user_id=user_id,
            document_ids=document_ids,
            top_k=top_k,
        )

        # 3. LLM generation with retrieved chunks
        llm = LLMService(
            provider="openai" if (api_key and provider == "openai") else provider,
            api_key=api_key,
            model=current_app.config.get("OPENAI_MODEL", "gpt-4o-mini"),
            base_url=current_app.config.get("OLLAMA_BASE_URL", "http://localhost:11434"),
        )

        result = llm.answer_question(question=question, context_chunks=relevant_chunks)
        return result
