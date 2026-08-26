import os
from typing import Dict, List, Any


class PDFExtractor:
    """PDF text extractor supporting PyMuPDF (fitz) with automatic fallback to pypdf."""

    @staticmethod
    def extract(file_path: str) -> Dict[str, Any]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found: {file_path}")

        # Try PyMuPDF first
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(file_path)
            pages: List[Dict[str, Any]] = []
            full_text_list: List[str] = []

            for page_idx in range(len(doc)):
                page = doc[page_idx]
                page_text = page.get_text() or ""
                pages.append({
                    "page_number": page_idx + 1,
                    "text": page_text,
                })
                full_text_list.append(page_text)

            doc.close()
            full_text = "\n\n".join(full_text_list)
            return {
                "full_text": full_text,
                "page_count": len(pages),
                "pages": pages,
                "extractor": "pymupdf",
            }
        except ImportError:
            pass
        except Exception:
            pass

        # Fallback to pypdf
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            pages = []
            full_text_list = []

            for idx, page in enumerate(reader.pages):
                try:
                    page_text = page.extract_text() or ""
                except Exception:
                    page_text = ""
                pages.append({
                    "page_number": idx + 1,
                    "text": page_text,
                })
                full_text_list.append(page_text)

            full_text = "\n\n".join(full_text_list)
            return {
                "full_text": full_text,
                "page_count": len(pages),
                "pages": pages,
                "extractor": "pypdf",
            }
        except Exception as e:
            raise RuntimeError(f"Failed to extract PDF text using available extractors: {str(e)}")
