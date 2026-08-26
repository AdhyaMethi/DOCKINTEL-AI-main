import math
import re
import hashlib
from typing import List


class EmbeddingService:
    """Embedding service abstraction with local deterministic dense vectorizer and external API support."""

    DIMENSION = 128

    @classmethod
    def generate_embedding(cls, text: str, api_key: str = "", provider: str = "fallback") -> List[float]:
        """Generates a normalized dense vector embedding for the input text."""
        if not text or not text.strip():
            return [0.0] * cls.DIMENSION

        # External OpenAI embedding if configured
        if provider == "openai" and api_key:
            try:
                import requests
                headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
                payload = {"input": text[:8000], "model": "text-embedding-3-small"}
                resp = requests.post("https://api.openai.com/v1/embeddings", json=payload, headers=headers, timeout=10)
                if resp.status_code == 200:
                    return resp.json()["data"][0]["embedding"]
            except Exception:
                pass

        # High-performance deterministic subword hashing vectorizer
        return cls._compute_deterministic_embedding(text)

    @classmethod
    def _compute_deterministic_embedding(cls, text: str) -> List[float]:
        """Produces a dense 128-dimensional L2-normalized vector using token-frequency and subword hashing."""
        vector = [0.0] * cls.DIMENSION
        clean_text = text.lower()
        words = re.findall(r"\b[a-z0-9_]{2,}\b", clean_text)

        if not words:
            return [0.0] * cls.DIMENSION

        for word in words:
            # Word level hashing
            h_word = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            idx_1 = h_word % cls.DIMENSION
            vector[idx_1] += 1.0

            # Character 3-grams for semantic subword capture
            for i in range(len(word) - 2):
                ngram = word[i:i + 3]
                h_ngram = int(hashlib.sha256(ngram.encode("utf-8")).hexdigest(), 16)
                idx_2 = h_ngram % cls.DIMENSION
                vector[idx_2] += 0.4

        # L2 Normalization
        norm = math.sqrt(sum(x * x for x in vector))
        if norm > 0.0:
            vector = [round(x / norm, 6) for x in vector]

        return vector

    @staticmethod
    def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        """Calculates cosine similarity between two vector embeddings."""
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0

        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))

        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0

        return max(0.0, min(1.0, dot_product / (norm_a * norm_b)))
