import re
import unicodedata


def clean_text(raw_text: str) -> str:
    """Cleans and normalizes extracted text."""
    if not raw_text:
        return ""

    # Normalize unicode characters (e.g. smart quotes, em dashes)
    text = unicodedata.normalize("NFKD", raw_text)
    
    # Replace non-standard whitespace characters with regular spaces
    text = re.sub(r"[\r\f\v]", "\n", text)
    text = re.sub(r"[\t ]+", " ", text)
    
    # Remove null characters and non-printable control chars (except standard \n)
    text = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)
    
    # Clean up hyphenated word splits across linebreaks (e.g. "instruc-\ntion" -> "instruction")
    text = re.sub(r"(\w+)-\n(\w+)", r"\1\2", text)
    
    # Collapse 3+ consecutive newlines to 2 newlines (preserve paragraphs)
    text = re.sub(r"\n{3,}", "\n\n", text)
    
    # Strip leading and trailing whitespace from each line
    lines = [line.strip() for line in text.split("\n")]
    text = "\n".join(lines)
    
    return text.strip()


def calculate_text_stats(text: str) -> dict:
    """Calculates comprehensive text metrics."""
    if not text:
        return {
            "char_count": 0,
            "word_count": 0,
            "sentence_count": 0,
            "paragraph_count": 0,
            "estimated_read_time_min": 0,
        }

    char_count = len(text)
    words = re.findall(r"\b\w+\b", text)
    word_count = len(words)
    
    # Sentence splitting regex
    sentences = re.split(r"(?<=[.!?])\s+", text)
    sentence_count = len([s for s in sentences if s.strip()])
    
    # Paragraphs
    paragraphs = [p for p in text.split("\n\n") if p.strip()]
    paragraph_count = len(paragraphs) if paragraphs else 1
    
    # Average adult reading speed ~200 words/min
    read_time = max(1, round(word_count / 200, 1)) if word_count > 0 else 0

    return {
        "char_count": char_count,
        "word_count": word_count,
        "sentence_count": sentence_count,
        "paragraph_count": paragraph_count,
        "estimated_read_time_min": read_time,
    }
