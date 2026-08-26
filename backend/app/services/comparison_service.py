import re
import difflib
from typing import Dict, Any
from backend.app.models.user import User
from backend.app.models.document import Document
from backend.app.ai.embedding_service import EmbeddingService


class ComparisonService:
    """Document comparison and diff analysis engine."""

    @classmethod
    def compare_documents(cls, user: User, doc_id_a: str, doc_id_b: str) -> tuple[dict, int]:
        doc_a = Document.query.get(doc_id_a)
        doc_b = Document.query.get(doc_id_b)

        if not doc_a or not doc_b:
            return {"success": False, "message": "One or both documents not found", "error_code": "NOT_FOUND"}, 404

        if not user.is_admin():
            if doc_a.user_id != user.id or doc_b.user_id != user.id:
                return {"success": False, "message": "Unauthorized to compare these documents", "error_code": "FORBIDDEN"}, 403

        text_a = doc_a.cleaned_text or doc_a.raw_text or ""
        text_b = doc_b.cleaned_text or doc_b.raw_text or ""

        # Sentence-level tokenization
        sents_a = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text_a) if s.strip()]
        sents_b = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text_b) if s.strip()]

        # Compute sequence matcher diff
        matcher = difflib.SequenceMatcher(None, sents_a, sents_b)
        similarity_ratio = round(matcher.ratio() * 100, 1)

        diff_blocks = []
        added_count = 0
        removed_count = 0
        unchanged_count = 0

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == "equal":
                for s in sents_a[i1:i2]:
                    diff_blocks.append({"type": "unchanged", "text": s})
                    unchanged_count += 1
            elif tag == "delete":
                for s in sents_a[i1:i2]:
                    diff_blocks.append({"type": "removed", "text": s})
                    removed_count += 1
            elif tag == "insert":
                for s in sents_b[j1:j2]:
                    diff_blocks.append({"type": "added", "text": s})
                    added_count += 1
            elif tag == "replace":
                for s in sents_a[i1:i2]:
                    diff_blocks.append({"type": "removed", "text": s})
                    removed_count += 1
                for s in sents_b[j1:j2]:
                    diff_blocks.append({"type": "added", "text": s})
                    added_count += 1

        # Semantic embedding vector similarity
        vec_a = EmbeddingService.generate_embedding(text_a[:5000])
        vec_b = EmbeddingService.generate_embedding(text_b[:5000])
        semantic_similarity = round(EmbeddingService.cosine_similarity(vec_a, vec_b) * 100, 1)

        return {
            "success": True,
            "data": {
                "document_a": {"id": doc_a.id, "title": doc_a.title, "document_type": doc_a.document_type, "words": doc_a.total_words},
                "document_b": {"id": doc_b.id, "title": doc_b.title, "document_type": doc_b.document_type, "words": doc_b.total_words},
                "metrics": {
                    "lexical_similarity_pct": similarity_ratio,
                    "semantic_similarity_pct": semantic_similarity,
                    "added_sentences": added_count,
                    "removed_sentences": removed_count,
                    "unchanged_sentences": unchanged_count,
                    "total_sentences_a": len(sents_a),
                    "total_sentences_b": len(sents_b),
                },
                "diff": diff_blocks[:200],  # Return up to 200 diff lines for smooth UI rendering
            }
        }, 200
