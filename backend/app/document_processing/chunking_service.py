import re
from typing import List, Dict, Any


class TextChunker:
    """Intelligent sentence-aware document chunker with overlap and page preservation."""

    def __init__(self, target_chunk_size: int = 350, overlap_size: int = 40):
        self.target_chunk_size = target_chunk_size
        self.overlap_size = overlap_size

    def chunk_pages(self, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Splits page-annotated document text into intelligent chunks."""
        chunks: List[Dict[str, Any]] = []
        chunk_idx = 0

        for page in pages:
            page_num = page.get("page_number", 1)
            page_text = page.get("text", "").strip()
            if not page_text:
                continue

            page_chunks = self._chunk_single_text(page_text, page_num, chunk_idx)
            for ch in page_chunks:
                chunks.append(ch)
                chunk_idx += 1

        # Fallback if no chunks generated
        if not chunks:
            chunks.append({
                "chunk_index": 0,
                "page_number": 1,
                "text_content": "[Empty Document]",
                "token_count": 2,
            })

        return chunks

    def _chunk_single_text(self, text: str, page_num: int, start_idx: int) -> List[Dict[str, Any]]:
        # Split text into sentences
        sentences = re.split(r"(?<=[.!?])\s+", text)
        sentences = [s.strip() for s in sentences if s.strip()]

        if not sentences:
            return []

        chunks: List[Dict[str, Any]] = []
        current_words: List[str] = []
        current_chunk_idx = start_idx

        for sentence in sentences:
            sentence_words = sentence.split()
            if len(current_words) + len(sentence_words) > self.target_chunk_size and current_words:
                chunk_str = " ".join(current_words)
                chunks.append({
                    "chunk_index": current_chunk_idx,
                    "page_number": page_num,
                    "text_content": chunk_str,
                    "token_count": len(current_words),
                })
                current_chunk_idx += 1

                # Retain overlap from end of previous chunk
                overlap_words = current_words[-self.overlap_size:] if len(current_words) >= self.overlap_size else current_words
                current_words = list(overlap_words) + sentence_words
            else:
                current_words.extend(sentence_words)

        # Remaining words
        if current_words:
            chunk_str = " ".join(current_words)
            chunks.append({
                "chunk_index": current_chunk_idx,
                "page_number": page_num,
                "text_content": chunk_str,
                "token_count": len(current_words),
            })

        return chunks
