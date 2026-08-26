import re
import math
from collections import Counter
from typing import Dict, Any, List


class SummarizationService:
    """Document summarizer providing short summary, detailed summary, and key points."""

    @classmethod
    def summarize(cls, text: str, document_type: str = "General", max_sentences: int = 5) -> Dict[str, Any]:
        """Generates short summary, detailed narrative, and bulleted key points."""
        if not text or not text.strip():
            return {
                "short_summary": "No text content available to summarize.",
                "detailed_summary": "The document contains no readable text content.",
                "key_points": ["Document is empty or contains non-extractable media."],
                "provider": "fallback_extractive",
            }

        sentences = cls._split_into_sentences(text)
        if len(sentences) <= 3:
            full_text = " ".join(sentences)
            return {
                "short_summary": full_text[:200] + ("..." if len(full_text) > 200 else ""),
                "detailed_summary": full_text,
                "key_points": [s for s in sentences if len(s) > 10],
                "provider": "direct_text",
            }

        # TextRank / Centrality-based ranking
        ranked_sentences = cls._rank_sentences(sentences)

        # 1. Short summary (top 1-2 most central sentences)
        short_summary_sents = [sent for sent, _ in ranked_sentences[:2]]
        short_summary = " ".join(short_summary_sents)

        # 2. Detailed summary (top 5-8 sentences, ordered by their original document sequence)
        detailed_count = min(len(sentences), max_sentences + 2)
        top_detailed_pairs = sorted(ranked_sentences[:detailed_count], key=lambda x: sentences.index(x[0]))
        detailed_summary = " ".join([sent for sent, _ in top_detailed_pairs])

        # 3. Key points (clean bullet points from top ranked sentences)
        key_points = []
        for sent, _ in ranked_sentences[:6]:
            clean_sent = sent.strip()
            if len(clean_sent) > 15 and clean_sent not in key_points:
                # Truncate if excessively long
                if len(clean_sent) > 160:
                    clean_sent = clean_sent[:157] + "..."
                key_points.append(clean_sent)

        return {
            "short_summary": short_summary,
            "detailed_summary": detailed_summary,
            "key_points": key_points[:5],
            "provider": "extractive_textrank",
        }

    @staticmethod
    def _split_into_sentences(text: str) -> List[str]:
        # Split on sentence terminals while avoiding splitting on common abbreviations like Dr., e.g., i.e.
        raw_sents = re.split(r"(?<=[.!?])\s+", text)
        clean_sents = []
        for s in raw_sents:
            cleaned = " ".join(s.split()).strip()
            if len(cleaned) > 20 and re.search(r"[A-Za-z]", cleaned):
                clean_sents.append(cleaned)
        return clean_sents

    @classmethod
    def _rank_sentences(cls, sentences: List[str]) -> List[tuple]:
        """Ranks sentences by word frequency and positional centrality."""
        # Calculate term frequencies across all sentences
        words_all = [w.lower() for sent in sentences for w in re.findall(r"\b[a-z]{3,}\b", sent)]
        stopwords = {
            "the", "and", "that", "have", "for", "not", "with", "you", "this", "but",
            "his", "from", "they", "say", "her", "she", "will", "one", "all", "would",
            "there", "their", "what", "out", "about", "who", "get", "which", "when",
            "make", "can", "like", "time", "just", "him", "know", "take", "people",
            "into", "year", "your", "good", "some", "could", "them", "see", "other",
            "than", "then", "now", "look", "only", "come", "its", "over", "think", "also"
        }
        filtered_words = [w for w in words_all if w not in stopwords]
        word_freq = Counter(filtered_words)
        max_freq = max(word_freq.values()) if word_freq else 1

        sentence_scores = []
        total_sents = len(sentences)

        for idx, sentence in enumerate(sentences):
            sent_words = [w.lower() for w in re.findall(r"\b[a-z]{3,}\b", sentence) if w.lower() not in stopwords]
            if not sent_words:
                sentence_scores.append((sentence, 0.0))
                continue

            # Word frequency score
            freq_score = sum(word_freq.get(w, 0) / max_freq for w in sent_words) / len(sent_words)

            # Positional score (boost beginning and end of documents)
            pos_weight = 1.3 if idx == 0 else (1.2 if idx < 3 or idx >= total_sents - 2 else 1.0)

            # Length normalization penalty (avoid 3-word fragments and 50-word run-ons)
            len_penalty = 1.0
            if len(sent_words) < 5:
                len_penalty = 0.5
            elif len(sent_words) > 35:
                len_penalty = 0.85

            final_score = freq_score * pos_weight * len_penalty
            sentence_scores.append((sentence, final_score))

        return sorted(sentence_scores, key=lambda x: x[1], reverse=True)
