import re
import math
from collections import Counter
from typing import List, Dict, Any


class KeywordService:
    """Extracts high-importance domain keywords and keyphrases with relevance scores."""

    STOPWORDS = {
        "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
        "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
        "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
        "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
        "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
        "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
        "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
        "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
        "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
        "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
        "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
        "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
        "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
        "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
        "they've", "this", "those", "through", "to", "too", "under", "until", "up",
        "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
        "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
        "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
        "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
        "yourself", "yourselves", "also", "may", "will", "can", "using", "used", "use",
        "one", "two", "three", "first", "second", "new", "page", "section", "document"
    }

    @classmethod
    def extract_keywords(cls, text: str, top_n: int = 15) -> List[Dict[str, Any]]:
        """Extracts top_n keywords and 2-word keyphrases with frequency and importance score."""
        if not text:
            return []

        clean_text = text.lower()
        words = re.findall(r"\b[a-z]{3,}\b", clean_text)
        filtered_words = [w for w in words if w not in cls.STOPWORDS and len(w) > 2]

        if not filtered_words:
            return []

        word_counts = Counter(filtered_words)
        total_filtered = len(filtered_words)

        # Also extract 2-gram keyphrases (e.g. "machine learning", "deep neural")
        bigrams = []
        for i in range(len(words) - 1):
            w1, w2 = words[i], words[i + 1]
            if w1 not in cls.STOPWORDS and w2 not in cls.STOPWORDS and len(w1) > 2 and len(w2) > 2:
                bigrams.append(f"{w1} {w2}")

        bigram_counts = Counter(bigrams)

        keywords_dict: Dict[str, Dict[str, Any]] = {}

        # Process unigrams
        for word, count in word_counts.most_common(top_n * 2):
            tf = count / total_filtered
            # Heuristic score favoring moderately specific terms
            score = round(math.log(1 + count) * (1 + 0.1 * len(word)), 4)
            keywords_dict[word] = {
                "keyword": word.title() if len(word) > 3 else word.upper(),
                "frequency": count,
                "score": score,
            }

        # Process significant bigrams (count >= 2)
        for phrase, count in bigram_counts.most_common(top_n):
            if count >= 2:
                score = round(math.log(1 + count * 2) * 1.5, 4)
                keywords_dict[phrase] = {
                    "keyword": phrase.title(),
                    "frequency": count,
                    "score": score,
                }

        # Sort and return top_n
        sorted_kw = sorted(keywords_dict.values(), key=lambda x: x["score"], reverse=True)
        return sorted_kw[:top_n]
