import os


class TextExtractor:
    """Extractor for plain text documents (.txt) with multi-encoding fallback."""

    @staticmethod
    def extract(file_path: str) -> dict:
        """Extract text from TXT file returning pages list and total page count."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        encodings = ["utf-8", "utf-8-sig", "latin1", "cp1252", "iso-8859-1"]
        raw_content = None

        for encoding in encodings:
            try:
                with open(file_path, "r", encoding=encoding, errors="strict") as f:
                    raw_content = f.read()
                    break
            except (UnicodeDecodeError, LookupError):
                continue

        if raw_content is None:
            # Fallback with replacement
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                raw_content = f.read()

        # For text files, simulate pagination if very long (~3000 chars per page)
        page_size = 3000
        pages = []
        if not raw_content.strip():
            pages = [{"page_number": 1, "text": ""}]
        else:
            chunks = [raw_content[i:i + page_size] for i in range(0, len(raw_content), page_size)]
            for idx, chunk in enumerate(chunks):
                pages.append({"page_number": idx + 1, "text": chunk})

        return {
            "full_text": raw_content,
            "page_count": len(pages),
            "pages": pages,
            "extractor": "text_utf8",
        }
