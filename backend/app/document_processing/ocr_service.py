import os
from typing import Dict, Any
from PIL import Image


class OCRExtractor:
    """OCR abstraction for image files (JPG, PNG) and scanned documents."""

    @staticmethod
    def is_ocr_available() -> bool:
        """Check whether pytesseract and the tesseract binary are available."""
        try:
            import pytesseract
            # Test simple version check
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False

    @classmethod
    def extract_image(cls, file_path: str, tesseract_cmd: str = "") -> Dict[str, Any]:
        """Extract text from an image file using OCR with graceful degradation."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Image file not found: {file_path}")

        extracted_text = ""
        ocr_applied = False
        ocr_error = None

        try:
            image = Image.open(file_path)
            img_format = image.format or "IMAGE"
            width, height = image.size

            import pytesseract
            if tesseract_cmd:
                pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

            try:
                # Perform OCR
                extracted_text = pytesseract.image_to_string(image)
                ocr_applied = True
            except Exception as ocr_e:
                ocr_error = str(ocr_e)
                extracted_text = f"[Image Document: {os.path.basename(file_path)} ({img_format} {width}x{height}px) - OCR engine was not available or produced no text: {ocr_error}]"

        except Exception as e:
            extracted_text = f"[Image Document: {os.path.basename(file_path)} - Unable to process image: {str(e)}]"

        return {
            "full_text": extracted_text.strip(),
            "page_count": 1,
            "pages": [{"page_number": 1, "text": extracted_text.strip()}],
            "ocr_applied": ocr_applied,
            "ocr_error": ocr_error,
            "extractor": "ocr_pytesseract" if ocr_applied else "image_fallback",
        }
