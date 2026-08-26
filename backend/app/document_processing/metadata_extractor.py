import re
from typing import Dict, Any, List


class MetadataExtractor:
    """Extracts structured and domain-specific metadata from document text."""

    @classmethod
    def extract_metadata(cls, text: str, document_type: str, filename: str) -> Dict[str, Any]:
        """Extract domain-specific metadata based on classified document type."""
        meta: Dict[str, Any] = {
            "document_type": document_type,
            "filename": filename,
            "char_count": len(text),
            "word_count": len(re.findall(r"\b\w+\b", text)),
        }

        # Common general extractions
        emails = list(set(re.findall(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b", text)))
        phones = list(set(re.findall(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b", text)))
        dates = list(set(re.findall(r"\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b", text, re.IGNORECASE)))

        meta["detected_emails"] = emails[:5]
        meta["detected_phones"] = phones[:5]
        meta["detected_dates"] = dates[:5]

        # Domain specific extractions
        if document_type == "Resume":
            meta.update(cls._extract_resume_meta(text, emails, phones))
        elif document_type == "Invoice":
            meta.update(cls._extract_invoice_meta(text, dates))
        elif document_type == "Research Paper":
            meta.update(cls._extract_research_meta(text, filename))
        elif document_type == "Contract":
            meta.update(cls._extract_contract_meta(text, dates))
        elif document_type == "Report":
            meta.update(cls._extract_report_meta(text))
        else:
            meta.update(cls._extract_general_meta(text, filename))

        return meta

    @staticmethod
    def _extract_resume_meta(text: str, emails: List[str], phones: List[str]) -> Dict[str, Any]:
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        candidate_name = lines[0] if lines else "Unknown Candidate"
        if len(candidate_name) > 50 or "@" in candidate_name or ":" in candidate_name:
            candidate_name = "Candidate"

        # Skills bank matching
        skill_catalog = [
            "Python", "JavaScript", "TypeScript", "React", "Vue", "Angular", "Node.js",
            "Express", "Flask", "Django", "FastAPI", "SQL", "PostgreSQL", "MySQL",
            "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP",
            "Git", "CI/CD", "Machine Learning", "Deep Learning", "NLP", "PyTorch",
            "TensorFlow", "HTML5", "CSS3", "TailwindCSS", "REST API", "GraphQL",
            "Java", "C++", "C#", "Go", "Rust", "Linux", "DevOps", "Agile", "Scrum"
        ]
        text_lower = text.lower()
        matched_skills = [skill for skill in skill_catalog if re.search(r"\b" + re.escape(skill.lower()) + r"\b", text_lower)]

        # Sections detection
        sections = []
        for sec in ["Experience", "Education", "Skills", "Projects", "Certifications", "Summary"]:
            if re.search(r"\b" + re.escape(sec) + r"\b", text, re.IGNORECASE):
                sections.append(sec)

        return {
            "candidate_name": candidate_name,
            "skills": matched_skills[:20],
            "detected_sections": sections,
            "contact_email": emails[0] if emails else None,
            "contact_phone": phones[0] if phones else None,
        }

    @staticmethod
    def _extract_invoice_meta(text: str, dates: List[str]) -> Dict[str, Any]:
        inv_num_match = re.search(r"\b(?:invoice|inv|bill)\s*(?:no\.?|number|#)?\s*[:.\s]?\s*([A-Za-z0-9-_]{3,20})\b", text, re.IGNORECASE)
        total_match = re.search(r"\b(?:total|amount due|balance due|grand total)\s*[:.\s]?\s*([$€£₹]?\s*[\d,]+\.?\d{0,2})\b", text, re.IGNORECASE)
        tax_match = re.search(r"\b(?:tax|vat|gst)\s*[:.\s]?\s*([$€£₹]?\s*[\d,]+\.?\d{0,2})\b", text, re.IGNORECASE)

        return {
            "invoice_number": inv_num_match.group(1) if inv_num_match else "INV-UNKNOWN",
            "total_amount": total_match.group(1) if total_match else None,
            "tax_amount": tax_match.group(1) if tax_match else None,
            "invoice_date": dates[0] if dates else None,
        }

    @staticmethod
    def _extract_research_meta(text: str, filename: str) -> Dict[str, Any]:
        # Extract abstract
        abstract_match = re.search(r"\babstract\b[:.\s]*(.*?)(?=\b(?:introduction|keywords|index terms|1\.)\b)", text, re.IGNORECASE | re.DOTALL)
        abstract = abstract_match.group(1).strip()[:1000] if abstract_match else None

        # Extract DOI
        doi_match = re.search(r"\b10\.\d{4,9}/[-._;()/:A-Za-z0-9]+\b", text)

        # Detect sections
        sections = []
        for sec in ["Abstract", "Introduction", "Related Work", "Methodology", "Experiments", "Results", "Discussion", "Conclusion", "References"]:
            if re.search(r"\b" + re.escape(sec) + r"\b", text, re.IGNORECASE):
                sections.append(sec)

        return {
            "doi": doi_match.group(0) if doi_match else None,
            "has_abstract": bool(abstract),
            "abstract_snippet": abstract[:300] if abstract else None,
            "detected_sections": sections,
        }

    @staticmethod
    def _extract_contract_meta(text: str, dates: List[str]) -> Dict[str, Any]:
        # Parties detection
        parties_match = re.search(r"\bbetween\s+([^,]+?)\s+and\s+([^,]+?)(?:,|\.|\s+dated|\s+effective)", text, re.IGNORECASE)
        governing_law_match = re.search(r"\bgoverned\s+by\s+(?:the\s+laws\s+of\s+)?([A-Za-z\s]+?)(?:\.|\n|;|,)", text, re.IGNORECASE)

        return {
            "party_a": parties_match.group(1).strip()[:100] if parties_match else None,
            "party_b": parties_match.group(2).strip()[:100] if parties_match else None,
            "effective_date": dates[0] if dates else None,
            "governing_law": governing_law_match.group(1).strip()[:60] if governing_law_match else None,
        }

    @staticmethod
    def _extract_report_meta(text: str) -> Dict[str, Any]:
        sections = []
        for sec in ["Executive Summary", "Key Findings", "Market Overview", "Financial Performance", "Recommendations", "Conclusion"]:
            if re.search(r"\b" + re.escape(sec) + r"\b", text, re.IGNORECASE):
                sections.append(sec)
        return {
            "report_sections": sections,
        }

    @staticmethod
    def _extract_general_meta(text: str, filename: str) -> Dict[str, Any]:
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        title_candidate = lines[0] if lines else filename
        if len(title_candidate) > 100:
            title_candidate = title_candidate[:100] + "..."
        return {
            "suggested_title": title_candidate,
        }
